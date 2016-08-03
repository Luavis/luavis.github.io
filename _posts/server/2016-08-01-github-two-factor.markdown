---
layout: post
title:  "github 2차 비밀번호 커멘드 라인"
date:   2016-08-01 18:50:00 +09:00
categories: server
description: ""
keywords: "github, two factor, 2차 비밀번호"
---

## Github에서 지원하는 Two-factor password(2차 비밀번호)

가장 활발하게 많은 오픈소스 프로젝트들이 운영되고 있는 Github에서는 보안성을 위해서 OTP형식의 2차 비밀번호를 지원한다. 나 또한 외주 프로젝트를 비롯해서 소프트웨어 마에스트로 등 여러 활동에서 생성한 프로젝트를 관리하기 위해서 github를 이용하기 때문에 보안에 문제가 생기면 안된다.

구글 계정 같은 경우에는 예전부터 2차 비밀번호를 사용했고 github 계정도 예전부터 사용해왔는데 문제는 그떄 어떤 가이드를 통해서 사용 중인 맥북에는 command line에서 two-factor password 때문에 계정문제에서 문제되지 않았는데 이번에 iMac을 구매하면서 문제가 command line을 통해서 http를 이용한 private repository의 clone혹은 push등에 문제가 생겼고 기억이 안나서 조금 해매다가 방법을 찾아서 또 잊어먹기 전에 블로깅 해둬야겠다는 생각을 했다.


## Two-factor password(2차 비밀번호) 설정

일단 [App Store](https://itunes.apple.com/kr/app/google-authenticator/id388497605)혹은 [Play store](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)를 통해서 Google Authenticator를 설치하자. 이를 통해서 다양한 OTP를 연동할 수 있는데 지금은 Github를 연동해볼것이다.

[https://github.com/settings/security](https://github.com/settings/security)에 접속하면 우선 Two-factor password를 설정할 수 있다.

![two-factor]({{ site_url }}/assets/two_factor.png)

설정해두면 github 로그인 시 패스워드 입력하고 OTP를 입력하게 된다. 

## Command line을 위한 설정

git command 자체가 2차 비밀번호를 지원하지는 않기 때문에 여러 우회적인 방법을 사용한다. git의 credential 기능을 이용하여 인증을 하게된다. 

### Windows

Windows의 경우에는 따로 credential 정보를 보호하고 저장하는 방법이 없기에 Microsoft사에서 제공하는 [Git Credential Manager for Windows](https://github.com/Microsoft/Git-Credential-Manager-for-Windows)를 설치하여 사용할 수 있다. Github repo의 README의 How to use설명에 있듯 ```You don't. It magically works when credentials are needed.``` 마법처럼 알아서 잘 로그인 창이 뜨고 Two-factor 입력창까지 GUI로 뜬다.

### macOS

Mac에서는 Keychain을 이용하여 github의 계정정보를 저장할 수 있다. 하지만 비밀번호를 저장하는 방식으로는 Two-factor password가 인증이 되지 않음으로 Personal access tokens를 이용하는 방법을 github에서는 권하고 있다. 이는 [https://github.com/settings/tokens](https://github.com/settings/tokens)에 접속하고 ```Generate new token``` 버튼을 이용해서 생성하면 key가 나오게 된다.

![personal-access-token]({{ site_url }}/assets/personal_access_token.png)

key 생성이 완료되면 Keychain을 열고 ```New Password Item(⌘N)```을 누르면 새로운 패스워드를 작성할 수 있는데 URL구간에 ```https://github.com``` 을 입력하고 Account name에는 계정 Password에는 발급받은 키를 입력하면 된다.

![keychain github]({{ site_url }}/assets/keychain-github.png)
