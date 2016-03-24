---
layout: post
title:  "Reset commit"
date:   2016-03-22 23:53:00
categories: server
description: "오늘 저녁에 생긴 일.."
keywords: "git, amend, commit, undo"
---

## 사건의 경위

소마에서 아는 사람이 팀원으로 있는 프로젝트 팀이 있었다. 이 팀의  repository의 커밋 메세지가 순위권에 들어갈 만큼 좋지 않은 이름의 커밋 메세지를 볼 수 있었습니다.

![굉장히 많이 많이 수정]({{ site_url }}/assets/manymany_commit.jpg)

나는 지나가다가 이것을 수정해볼것을 의뢰받았지만 커밋메세지를 수정해본적은 없기때문에, (amend commit과 같이 바로 이전 커밋에 오타가 있어 수정하고 싶은 경우정도는 있었습니다.)(이런 흑마법은 쓰지 말라고 배웠습니다.) git-scm에서 찾아봤고, 이 문서의 약간 내용이 길어서 요점만 정리해보았습니다.

## 결론

1. git rebase -i <커밋의 ID / HEAD...> :  이렇게 하면 커밋을 롤백할 수 있다.
![pick]({{ site_url }}/assets/git-pick.png)
1. 여기서 수정을 원하는 커밋을 pick에서 edit로 바꾼다.
1. ```git commit --amend```를 통해서 커밋 내용을 수정할 수 있고.
1. 그런뒤 ```git rebase --continue```를 하면 수정된 내용을 확인할 수 있다.

위 결론은 약간의 문제가 있었다 커밋의 timestamp들이 모두 rebase한다음 amend한 값으로 바뀐것이다. 사실 ```git rebase -i ```를 해보고 그 다음에 주석 설명을 읽어보면 알겠지만 edit은 커밋의 내용 자체가 바뀌게 되는 경우에 사용하는것이다. 소소하게 커밋 메세지만 수정하고싶은 개발자를 위한 옵션인 reword가 있다. 위와 같은 방식이나 edit이 아닌 reword로 바꾸고 커밋을 따로 할 필요 없이 지정된 ```EDITOR```로 커밋메세지를 수정할 수 있다.


## 추가사항

위의 수정하고 난 커밋은 date가 바뀌고 나서 그러면 date도 바꾸려면 어떻게 해야하는가에 대해서 궁금해졌고(예전에 커밋메세지 date 바꿔서 작업을 매일한것처럼 보이게 한다는 도시전설을 들어본적이 있어서 된다는것만 알고 있었다.) 구글에 찾아보니 생각보다 쉽게 변경할 수 있었다.

```bash
git filter-branch --env-filter \
    'if [ $GIT_COMMIT = <원하는 커밋메세지 ID> ]
     then
         export GIT_AUTHOR_DATE="Fri Jan 2 21:38:53 2009 -0800" # ISO date
         export GIT_COMMITTER_DATE="Sat May 19 01:01:01 2007 -0700" # ISO date
     fi'
```

```filter-branch```는 아마도 커밋의 내용을 수정할 수 있는 방법을 제공하고 있는것 같아보인다. 아마 이 방법을 조금만 응용해도 커밋 메세지를 수정할 수 있을것 같다.