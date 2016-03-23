---
layout: post
title:  "Reset commit"
date:   2016-03-16 10:53:00
categories: server
description: "오늘 저녁에 생긴 일..2"
keywords: "git, amend, commit, undo"
---

## 사건의 경위

소마 프로젝트를 진행하는 옆동네 팀의 깃 커밋 메세지가 굉장히 좋지 않은 이름의 커밋 메세지가 있어서 이를 수정하는 방법에 대해서 물어봤다.
나도 처음 해보는 일이기 때문에 git-scm에서 찾아볼 수 있었고 해당 문서의 약간 내용이 길어서 요점만 정리하면

![굉장히 많이 많이 수정]({{ site_url }}/assets/manymany_commit.jpg)

## 결론

1. git rebase -i [커밋의 ID / HEAD...] :  이렇게 하면 커밋을 롤백할 수 있다.
![pick]({{ site_url }}/assets/git-pick.jpg)
1. 여기서 수정을 원하는 커밋을 pick에서 edit로 바꾼다.
1. ```git commit --amend```를 통해서 커밋 내용을 수정할 수 있고.
1. 그런뒤 ```git rebase --continue```를 하면 수정된 내용을 확인할 수 있다.
