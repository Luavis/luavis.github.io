---
layout: post
title:  "COW(Copy-on-write) 기반의 Python garbage collection"
date:   2017-12-21 13:27:00 +09:00
categories: python
description: Copy-on-write가 발생하는 Python GC의 공유 메모리상에서 생기는 문제점을 해결하는 과정, Instagram이 GC를 없앤 이유 속편
keywords: python, django, production, garbage collection, gc, insatgram, memory, management, multi processor

---

## tl;dr

이 글은 [Instagram의 블로그 글](https://engineering.instagram.com/copy-on-write-friendly-python-garbage-collection-ad6ed5233ddf)을 번역하고, 저의 개인적인 생각을 담은 글입니다. 혹시 이전 시리즈에 대한 번역은 [이 문서](/python/dismissing-python-garbage-collection-at-instagram)에서 확인할 수 있습니다.
Instagram팀은 GC를 끔으로써 이슈를 해결했던 방법이 문제점이 있는 것을 파악하고 새로운 API를 추가해서 이를 해결했습니다. 해당 API는 Python 3.7에 새롭게 들어간 [gc.freeze](https://docs.python.org/3.7/library/gc.html#gc.freeze)입니다. 해당 API가 어떤 맥락에서 추가되었는지 어떤 상황에서 사용해야 하는지 설명하고 있습니다.

## Copy-on-write friendly Python garbage collection

Instagram은 모든 코드가 Python으로 작성된 Django 웹 프레임워크를 사용해서 세상에서 가장 큰 규모로 운영하고 있습니다. Instagram은 Python의 simple 함 때문에 초기부터 Python을 사용해 왔습니다, 그러나 전체 규모가 확장되는 것만큼 simple 함을 유지하고자 수년간 많은 튜닝을 진행했습니다. 작년에는 Python의 [GC를 없애는 방법을](https://engineering.instagram.com/dismissing-python-garbage-collection-at-instagram-4dca40b29172)([번역](/python/dismissing-python-garbage-collection-at-instagram)) 시도해 봤고 10%의 memory 효율을 볼 수 있었습니다. 그러나 Instagram의 engineering 팀과 기능의 지속적인 추가에 따라서 메모리 사용률 또한 올라갔습니다. 결국엔 GC를 비활성화 함으로써 얻을 수 있는 이익을 잃게 되었습니다.

밑에 그림은 요청의 수가 증가함에 따라서 메모리 사용량의 증가에 대해서 나타낸 그래프입니다. 요청이 3,000건이 넘으면서부터는 프로세스가 ~ 600MB 이상의 메모리를 사용했습니다. 더 중요한 것은 선형적으로 증가한다는 점입니다.

![](/assets/instagram-req-graph-1.png)

부하 테스트를 해보면 메모리 사용량이 병목의 지점이 되었습니다. GC를 활성화하면 이 문제가 조금은 완화되고 메모리 사용률 증가 폭이 작아집니다. 하지만 원하지 않는 Copy-on-write(COW)는 계속 발생해 메모리 사용량이 증가합니다. 그래서 Instagram팀은 COW 없이도 Python GC가 동작할 수 있게 되면 어떻게 메모리 오버헤드가 줄어들 수 있는지 확인해보자 결정했습니다.

![](/assets/instagram-req-graph-2.png)
<div style="text-align: center">빨간색: GC가 없는 경우 / 파란색: GC를 명시적으로 호출해주는 경우 / 초록색: 일반적인 Python GC 경우</div>

## 첫 번째 시도: GC head data 구조체 변경

이 이전 GC 글을 잘 읽어보면 COW의 원흉은 Python object마다 앞에 붙어 있는 헤드 부분입니다.

```python
/* GC information is stored BEFORE the object structure. */
typedef union _gc_head 
{
    struct {
        union _gc_head *gc_next;
        union _gc_head *gc_prev;
        Py_ssize_t gc_refs;
    } gc;
    long double dummy; /* force worst-case alignment */
} PyGC_Head;
```

COW가 발생하는 이유는 GC가 발생할 때 마다 모든 track 되고 있는 object의 `gc_refs`와 `ob_refcnt`가 업데이트 되는 데에 있습니다. 그러나 불행히도 memory의 페이지에 COW를 발생하게 만듭니다. (이 부분은 이전 글에 자세히 나와있습니다) 이를 해결하기 위해서는 모든 Python object의 헤드 부분을 이를 한곳에 모아두는 것입니다. (역자주] 이렇게 되면 GC로 인한 refcount 업데이트 시에 COW 되는 page의 수를 줄일 수 있습니다)

그래서 gc_head의 포인터를 만들어서 GC가 발생하는 동안 변동사항이 없게 만들었습니다.

```python
typedef union _gc_head_ptr
{
    struct {
        union _gc_head *head;
    } gc_ptr;
    double dummy; /* force worst-case alignment */
} PyGC_Head_Ptr;
```

이 방법이 성공했는지 평가해보기 위해서 밑에 있는 메모리를 할당받는 스크립트를 사용해 자식 프로세스를 fork 했다.

```python
lists = []
strs = []
for i in range(16000):
    lists.append([])
    for j in range(40):
        strs.append(' ' * 8)
```

과거의 `gc_head` 구조체는 자식 프로세스의 RSS(Resident set size) 메모리 사용률이 ~ 60MB까지 상승했다. 새롭게 작성한 구조체에서는 ~ 0.9MB밖에 증가하지 않아, 성공한 것으로 보입니다.

그러나 위의 구조체에서 새롭게 추가된 포인터는 새로운 메모리 오버헤드로 작용할 수 있습니다. (2개의 포인터이기에 16byte 정도) 매우 작은 수 인듯 보이지만 Python의 모든 GC 가능한 객체에 적용된다는 점을 생각해보면 이는 매우 큰 오버헤드가 될 수 있습니다. (Instragram팀에서는 한 프로세스에 수백만 개의 객체를 사용하고 host 당 약 70개의 프로세스가 실행된다)

	16byte * 1,000,000 * 70 = ~ 1GB
	
## 두 번째 시도: GC에게 공유 객체 숨기기

새롭게 제안한 `gc_head` 구조체는 메모리 효율에 이점이 있다고 한들, 오버헤드는 이상적인 방향이 아니다. 찾고자 하는 해결법은 눈에 띄는 성능에 지장이 없이 GC를 활성화하는 방법이다. COW가 발생하는 근본적인 문제는 자식 프로세스가 fork 되기 전에 부모 프로세스가 만든 객체를 공유하는 데에 있습니다. 그래서 Python GC가 공유되는 객체에 대해서만 다르게 취급하면 됩니다. 쉽게 이야기하면 GC의 동작 과정에서 공유 객체만 숨겨 GC 과정에 공유 객체가 포함되지 않는다면 문제는 해결됩니다.

이런 해결법을 적용해서 simple 한 Python GC 모듈에 `gc.freeze`라는 API를 추가했다. 이 API는 Python이 내부에서 GC 가능한 객체를 관리하고 추적하는 리스트인 Python GC generation 리스트에서 원하는 객체를 삭제하는 것이다. Instagram에서는 이 API를 CPython에 올렸고, Python 3.7 릴리즈에서 사용 수 있다.([https://github.com/python/cpython/pull/3705](https://github.com/python/cpython/pull/3705))

```python
static PyObject *
gc_freeze_impl(PyObject *module)
{
    for (int i = 0; i < NUM_GENERATIONS; ++i) {
        gc_list_merge(GEN_HEAD(i), &_PyRuntime.gc.permanent_generation.head);
        _PyRuntime.gc.generations[i].count = 0;
    }
    Py_RETURN_NONE;
}
```

## 성공 !

Instagram팀에서는 이 성능 튜닝을 production에서 사용하고 있고 이번에는 우리가 원했고 예상했던 것과 같이 COW가 더 발생하지 않았고 공유 메모리는 일정했습니다. 반면에 평균 요청당 메모리 사용량 증가 폭은 ~ 50% 가까이 떨어졌습니다. 밑에 있는 그래프는 GC를 활성화로 메모리 증가 폭에 어떤 변화가 있는지 표시되어 있습니다. 처음에 봤던 메모리 사용의 선형적인 증가가 멈추었고 이는 각각의 process가 더 오래 동작할 수 있도록 해줍니다.

![](/assets/instagram-req-graph-3.png)

## Credits

Thanks to Jiahao Li, Matt Page, David Callahan, Carl S. Shapiro, and Chenyang Wu for their discussions and contributions to the COW-friendly Python garbage collection.

Zekun Li is an infrastructure engineer at Instagram.