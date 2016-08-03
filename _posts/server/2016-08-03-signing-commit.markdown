---
layout: post
title:  "GPG로 Git 커밋 사인"
date:   2016-08-03 23:45:00 +09:00
categories: server
description: "GPGtool을 이용하여 Git 커밋을 사인해보자"
keywords: "github, git, gpg, gpgtools, gpg siging"
---

## GPG

RSA가 개발되고 나서 취약했던 프로토콜들이 RSA 암호화 기술을 덮어 씌워져서 비교적 안전한 통신이 가능하도록 만든 사례가 많다. 우리가 쉽게 발견할 수 있는 사례로는 HTTPS가 있다. GPG의 원조격인 PGP(Pretty Good Privacy)는 원래 이메일을 RSA로 암호화 해주는 프로그램이였고 이 아이디어를 바탕으로 오픈소스로 개발된것이 GPG(Gnu Privacy Guard)다. <strike>한국에서도 샾메일이라고 메일 암호화를 개발한적이 있습니다..</strike>

우선 최근에 iMac환경을 셋팅하면서 dotfiles도 제작하고 이거저거 좋다는거 해보면서 시도해보게되었다.(알고있는건 꽤 되었는데 좀 귀찮았다..) 일단 git-scm에 나와 있는 설명으로는 이를 통해서 조금 더 출처가 확실한 곳으로 부터 커밋을 받을 수 있기때문에 안전하다라는 설명이다. 사실 그런점 보단 커밋을 하고 git에서 확인하면 아래 그림과 같이 뭔가 멋진 녹색 문구가 들어간다.

![gpg-github-example]({{ site_url }}/assets/gpg-github-example.png)



## 우선 GPG를 설치해야한다

필자의 환경은 맥을 기준으로 글을 작성할 것이다. 맥에서는 gpg를 기본으로 지원하고 있지 않기 때문에 brew를 이용해서 설치를 할것이다. 흥미로운 점은 GPGTools에서 이미 GUI 툴로 제공한다 그리고 brew는 homebrew-cask라는 프로그램을 통해서 macOS의 GUI app을 관리할 수 있는 기능을 제공해왔는데 이게 통합되어서 추가로 설치할 필요 없이 바로 이용할 수 있 으니 애용하자!

GPGTools를 설치하기 위해선 아래 커멘드를 실행해보자.

{% highlight shell %}

	$ brew cask install gpgtools

{% endhighlight %}

혹시나 설치가 되지 않는다면 brew가 최신버전인지 확인해보자, 최신버전이 아니면 설치가 안된다.

설치가 완료되면 ```GPG Keychain```를 실행한다.

![gpg-keychain-example]({{ site_url }}/assets/gpg-keychain-example.png)

위와같은 실행화면이 보이면 새로운 키를 생성하고 이미 GPG키가 있다면 import시키면 된다.
주의할 점은 **Full name과 Email address가 git의 author의 name과 email과 같도록 하는게 좋다.** (어떤 키로 사인할지 따로 설정할 수도 있지만 되도록 같으면 따로 설정안해도 잡는다.)

## git 설정

아래 커멘드를 사용하면 커밋을 사인할 수 있지만 플래그를 하나 더 붙혀야되는건 귀찮음으로 항상 커밋시 자동으로 사인할 수 있도록 하는 방법이 있다.
{% highlight shell %}

	$ git commit -S -m 'signed commit'

{% endhighlight %}

아래와 같이 git의 config를 수정하면 항상 gpg 사인이 가능하도록 설정할 수 있다.

{% highlight shell %}

	$ git config --global commit.gpgsign true

{% endhighlight %}

또 사용자가 특정 GPG키만 사용하도록 하려면 아래와 같은 커멘드를 사용하여 설정할 수 있다.

{% highlight shell %}

	$ git config --global user.signingkey <KEY>

{% endhighlight %}

## github 설정

[github의 설정페이지](https://github.com/settings/keys)에 접속하여 GPG key를 설정해두면 github 사용자의 gpg key가 설정된다.

![github-gpg-setting]({{ site_url }}/assets/github-gpg-setting.png)


## 참고

* [https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-%EB%82%B4-%EC%9E%91%EC%97%85%EC%97%90-%EC%84%9C%EB%AA%85%ED%95%98%EA%B8%B0](https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-%EB%82%B4-%EC%9E%91%EC%97%85%EC%97%90-%EC%84%9C%EB%AA%85%ED%95%98%EA%B8%B0)
* [https://help.github.com/articles/signing-commits-using-gpg/](https://help.github.com/articles/signing-commits-using-gpg/)