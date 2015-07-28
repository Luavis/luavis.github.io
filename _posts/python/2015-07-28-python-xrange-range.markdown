---
layout: post
title:  "Python range and xrange"
date:   2015-07-28 15:27:00
categories: python
description: difference between xrange and range
keywords: python, xrange, range

---

Sublime에서 syntax설정이 python으로 되어 있을때, for문을 입력하면 자동 완성으로 

{% highlight python linenos %}
for x in xrange(1,10):
    pass
{% endhighlight %}

이렇게 완성되는데 xrange와 그냥 range의 차이에 대해서 궁금해 졌고 [stackoverflow](http://stackoverflow.com/questions/94935/what-is-the-difference-between-range-and-xrange-functions-in-python-2-x)에 같은 질문을 한 글을 볼 수 있었다.

중요한건 언제나 답변인데,

----

range creates a list, so if you do range(1, 10000000) it creates a list in memory with 10000000 elements. xrange is a generator, so it is a sequence object is a that evaluates lazily.

range는 list를 만들어준다, 따라서 만약 range(1, 10000000)를 선언하면 10000000의 elements가 만들어진다.
xrange는 시퀀스 객체로 필요한 순간에 만들어준다.

----
취소선이 좀 많아 아래 답변의 답변(?)을 확인해보니 generator는 아니고 늦게 발생기켜준다는거 같다..(차이점이....)

그래서 진짜인가 확인해보려고 작은 python code를 작성하였다.

{% highlight python linenos %}

range(1, 10000000)

while True:
    pass
{% endhighlight %}

range를 사용한 경우인데 이때 Activity monitor로 메모리 점유율을 확인해보면:

![range test]({{ site_url }}/assets/python-range-test.png)

하지만 위의 range를 xrange로 바꾸면: 

![range test]({{ site_url }}/assets/python-xrange-test.png)

237M에서 3M로 줄어든다. 상황에 따라 사용하는게 맞다고 생각된다.


> Python 3.0에서는 xrange는 없어졌고, range가 대신 xrange와 같은 방식으로 동작한다.