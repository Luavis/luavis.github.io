---
layout: post
title:  "amed commit 취소"
date:   2016-03-16 10:53:00
categories: server
description: "오늘아침에 생긴 일.."
keywords: "git, amend, commit, undo"
---

## 사건의 경위

소마에서 게임 프로젝트를 진행 중인데 언리얼 엔진을 사용 중이고 이를 git과 git lfs를 이용해서 소스제어를 하고 있었다. 오늘 아침 너무 피곤한데 수업도 재미없어서 rdp를 연결하고(이것도 학교에서 포트를 막아둬서 ssh 터널링을 이용해서 연결할 수 있었다.). 이전에 작업해둔걸 커밋을 올리는데 나오는 메시지의 내용은 초기 커밋시 user.email 정보와 user.name 정보를 설정해주세요. 였다. 전혀 당황할 거 없이 설정해줬고 메시지를 훑어본 뒤에 amend commit을 실행했고 commit msg를 남기는 vim이 떠서 오 윈도(power shell)에서 vim을 보다니 신기하네 하고 :q하고 엔터를 치는 순간 아주 많이 심각하게 안 좋은 느낌이 들었다…. git commit msg가 이전 작업자의 commit msg였고 내가 유저 정보를 저장하기 전에 했던 커밋은 아예 무효가 됐다내가 amend commit을 했던 이유는 예전에 비슷할 때 amend commit을 하라고 했던 거 같아서였는데 이게 착각인 것인지 이전 commit이 내 파일과 겹쳤고 이러면 push 할 때 문제가 발생하니까 큰일 났네 고쳐야지 하고 메시지를 읽어보니 뭔가 pull이란 글자가가 쓰여 있어서 'pull 하면 이 상황이 복구되나?'(이 당시 제정신이 아녔다.) 하고 pull을 실행한 순간 이미 remote repo에 있는 정보와 내 것과 섞이면서 뭔가 하면 안될 것이 된 거 같은 느낌이 들었다. 2줄로 요약하면 상황은….

1. 실수로 git amend commit 시켜서 이전 작업자의 커밋 내용과 섞여버렸다.
1. 이런 상태에서 git pull까지 해서 conflict도 발생했다.


![살려야한다]({{ site_url }}/assets/keep-a-live.jpg)

**살려야한다.**

## 해결 과정

그래서 우선 ```git reset --hard HEAD```를 날려서 pull받아서 생긴 conflict는 해결했다. 이건 해본적 있기에 쉽게 생각해냈고 그렇지만 amend commit을 복구할 수 있을까 싶은 맘으로 구글링을 해보니 ref log란 것에 대해서 알 수 있었다. 이를 통해서는 git  hard reset이 일어나도 살릴 수 있어 보인다. [링크](https://git-scm.com/book/ko/v1/Git%EC%9D%98-%EB%82%B4%EB%B6%80-%EC%9A%B4%EC%98%81-%EB%B0%8F-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%B3%B5%EA%B5%AC). 일단 문제를 해결하기 전에 혹시나 레포가 깨지는것을 방지하기 위해 맥에서 git repo를 하나 생성하고 이 위에 같은 시나리오를 재현한 뒤 ```git reset --soft HEAD@{1}```를 실행했고 그렇게 했더니 amend commit이 취소되고 원래 커밋으로 복구되었다 그리고 다시 한번 커밋을 올리니까 잘되더라... 그리고 이걸 unreal이 있는 rdp로 돌아가서 해보니 ```error: unknown switch `e'``` 이런 메시지가 떠서 [찾아보니](https://github.com/dahlbyk/posh-git/issues/106) 윈도에서는 ```git reset --soft 'HEAD@{1}'``` '로 감싸줘야 한다고 한다.


## 결론

1. amend commit으로 실수로 덮어썼을 때는 너무 당황하지 말고 ```git reset --soft 'HEAD@{1}'``` 날려줘서 undo 시키고 다시 커밋을 올리자.
1. 개발자는 커피가 필요하다.
1. git은 굉장해...
