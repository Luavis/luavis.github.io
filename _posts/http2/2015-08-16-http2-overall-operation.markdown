---
layout: post
title:  "RFC 7540(HTTP 2) 전체적인 동작방식"
date:   2015-08-16 11:10:00
categories: http2
description: http2의 전체적인 동작방식에대한 짤막한 정리
keywords: http, http2, 동작, 방식, 방법, 구현, 특징

---

![Http logo]({{ site_url }}/assets/http2-fast-websites.png)

---

## HTTP/2의 전체적인 동작방식

일단 글쓴 나도 솔직히 아직 전 text를 다 읽지 않고 앞부분과 구현에 필요한 부분만 조각조각 읽어 완벽하지는 않지만, 여태까지 쓴 글들이 거의 직번역인 글이 많고 두서없이 쓴 경우가 대부분이라... 전체적으로 정리해서 써보기로 했다.

----

HTTP/2는 표준에 서론부분에서도 이야기하고 있듯이 의미적인 부분보다는 데이터를 주고 받는부분에서 큰 변화가 있다. 기본적으로는 HTTP/1과 같이 하나의 Request를 보내면 그에 해당하는 하나의 Response가 오게되어 있고 HTTP의 헤더의 의미에도 큰 변화가 없으며, 말그대로 의미적으로는 달라진게 없다.

> 반례로 의미적으로 바뀐사례는 HTTP/1에서 1.1로 넘어갈때는 의미적으로 많은 변화가 있었다.

우선, HTTP/1에서 버전 2로 넘어오면서 크게 바뀐 점은(많은 ppt에서 떠들어대듯...) 3가지 정도 있다.

1. HTTP 헤더 압축

1. Multiplexing

1. Server push

이 3가지 인데 해당하는 것을 하나하나 차례대로 써보도록 했다.

----

## HTTP 헤더

### 압축

HTTP header압축에 대해서는 따로 표준을 따로(RFC 7451) 문서로 만둘어 둘 만큼 까다로운 규칙을 가지고 있다, 헤더 압축기능에는 단순히 압축뿐만아니라 key와 value의 쌍에 대한 indexing기능도 포함하고 있어, 헤더의 길이를 매우 줄일 수 있다.

예를 들어 User-agent에 해당하는 값에 대해선 한번의 connection에서 한번 보내게 되면 이 값을 indexing하기로 약속했다면 다음에는 1바이트로 이를 주고 받을 수 있다.

여기서 특이한점은 쿠키에관련된 내용인데, cookie 헤더의 값은 여러개의 쿠키를 ;를 delimiter로 사용하여 나타낸다. 이러면 cookie 값이 하나만 바뀌어도 전체를 다시 indexing해야한다는 불편함이 있어, 표준에서는 하나의 cookie헤더에 하나의 cookie만을 적재하게 했다.

예를 들어, ```Cookie: a=b; c=d``` 라고 하는 cookie헤더가 있다면 이를 ```cookie: a=b```와 ```cookie: c=d```로 나타내어 indexing의 효율을 극대화하고 있다.(세션 쿠키같은 왠만한 상황에서 안 바뀌는 쿠키도 있기 때문에)

표준에서는 기존 브라우저 위에서 동작하던 DOM객체를 이용한 Javascript 소스와 PHP나 dJango RoR등 여러 Web Application Server들의 하위호환을 위해서 이 값을 기존 HTTP/1.1 때와 같은 형식으로 reformat해주고 넘겨줄 것을 의무화하고 있다.

자세한 사항은 HPACK에대해서 매우 자세히 예를들고 있는 이 [포스트]({{ site_url }}/http2/http2-header/)로..

### Virtual Header

HTTP/2에는 따로 HTTP 버전이나, status code, method등을 표기하는 곳이 없다. 이를 위해서 가상헤더를 만들어 두었는데

1. :status
1. :authority
1. :scheme
1. :method
1. :path

이런 종류의 가상헤더가 있다, 각각의 이름에 해당하는 값을 넣어서 보내면 되는데, authority는 domain이 들어가는거 같은데 정확히 어떤 이유에서 표기하는지에 대해서는 잘 모르겠다...(표준 문서에 나와 있습니다, 제가 안 읽었을뿐...)

### 그 외

일단 기존 HTTP/1과는 다르게 모든 header의 key는 소문자 표기해야한다. (User-Agent를 user-agent로, Cookie를 cookie로)


---

## Multiplexing

### stream

stream은 하나의 Request를 보내고 그에 해당하는 하나의 Response를 받을 수 있는 단위... 라 생각하는게 편할듯하다.(표준 문서에는 거창하게 써있지만 실제는 하나씩 왔다 갔다하니까.)

물론 기존 HTTP/1.1에서도 하나의 connection에 여러개의 request를 보낼 수있는 구조였다.(Keep-Alive라고...) 하지만 이는 매우 큰 문제가 발생될 수 있는 구조인데, 여러개의 request를 날리면 서버는 이에대해서 request의 차례에 따라 순서대로 response를 보내야한다. 따라서 만약 하나의 response가 사이즈가 길거나 어떤 이유에서인지 서버에러로 인해서 무한루프를 뛰고 있다면(처리속도가 오래걸린다면) 다음 response는 아무리 몇바이트 짜리 js 파일이라하더라도 받을 수 없다.

이는 전체적인 처리속도의 저하를 일으키는데 이 문제를 Head of line blocking(한 라인에서 앞 대가리가 멈춤문제, 쯤으로 번역이..)라고 한다

이를위해서 2에서는 Stream이라는 단위로 Request와 Response를 주고 받는 단위를 자르고 이를 다시 Frame이란 단위로 잘게 짤랐다, Frame은 오고가는 데이터의 묶음이다.

동작방식은 이러하다.

1. Client가 stream을 연다. 열 때는 HTTP header정보가 들어가 있는 HEADERS frame을 날려서 여는데 헤더를 다 보냈으면 END_HEADER라는 flag를 설정해서 보낸다.

1. 그리고 POST형식으로 Entity를 보낼 내용이 있다면 DATA frame으로 추가적으로 날리고 END_STREAM flag를 체크하여 Reqeust를 종료한다. 만약 보낼 데이터가 없었다면 마지막 HEADERS frame에 END_HEADERS와 END_STREAM을 둘 다 설정해서 보냈을 것이다.

1. END_STREAM로 인해서 half-closed 상태가 되고 이제 client는 더 이상 이 스트림에 데이터를 보낼 수 없다, 왜? 당연히 server 이제 응답할 차례니까..

1. Server는 HEADERS frame을 통해서 response header를 보내게된다. 그리고 response stream을 다 보냈다면 client와 마찬가지로 END_HEADER를 설정해서 보낼것이다.

1. Server는 DATA frame을 통해서 요청에 대한 응답 내용을(html이나 json이나 뭐던간에) 보낼 것이다. 그리고 client와 마찬가지로 끝나면 END_STREAM을 설정할테고 만약 보낼 데이터가 없었다면 END_STREAM을 마지막 HEADERS frame에 설정해서 보냈을 것이다.

1. 이렇게 stream이 하나가 닫친다.(closed)

대충 이런 순서로 동작하는데 send를 할때는 위의 내용을 frame의 단위로 보내게된다. 그러면 한번에 client는 서로 다른 request를 나타내는 stream의 frame이 섞여서 보낼것이고, 받는쪽인 server에서는 이를 stream별로 정리하여 해석하고 다시 그에대한 응답은 먼저 준비되는 순서대로 보낼 수 있다. 것이다.

이로 인해서 하나의 request가 처리가 오래걸려도 다른 request에는 문제가 없이 처리되어 response를 받을 수 있게되는 것이다.

## Server push

처음에 말만 들었을 때는 Server push기능은 notification 기능인줄 알았지만, 어떻게 보면 이보다 더 대단한 기능일지도 모른다...(Notification 기능으로는 SSE, Server Sent Event나 Websocket을..)

이 기능은 예를 들어 어떤 html파일이 있다고 생각하자, 그러면 이 html 파일은 아마도 일반적으로는 CSS나 JS를 필요로 할 것이다 그리고 보통 웹 브라우저는 html을 요구하고 기다려야한다. 왜냐하면, html파일을 읽어보기 전까지는 자신이 어떤 리소스가 필요로한지 모르기 때문에, HTML을 요청시키고 기다렸다가 도착하면 읽고 분석해서 여러개의 connection을 생성해서 css, js, image등의 리소스를 요청하기 시작한다.

이런 문제점을 해결하고자 나온 기능이 서버푸쉬다 HTML을 보내기 전부터 필요한 리소스 파일들을 받으면서 HTML을 동시에 받고 같이 렌더링해서 request에 드는 시간적인 비용 그리고 처리로 인해서 걸리는 delay를 없애겠다는 생각이다.

동작방식은 위의 **Stream**에 동작관련된 내용의 4번에서부터 시작한다.

1. 서버는 HEADERS frame을 이용해서 response header를 보냄과 동시에 PUSH_PROMISE라는 frame을 이용해서 어떤 request를 PUSH할 것인지 client에게 알려준다. PUSH_PROMISE에는 header를 넣을수 있는데, header영역에는 push할 content의 path나 method등 일반적인 reqeust 헤더와 동일한 구조를 넣어주면 된다. 또 이  frame에는 push할 데이터를 어떤 stream을 통하여 보낼껀지 적어둘 수있는데 이때 stream은 당연히 사용중이면 안되고, 해당 스트림은 reserved된다.

1. 기존에 처리되고 있던 stream과는 별개로 이제 reserved되 있던 stream으로 서버는 보내고자 하는 push data의 response header를 날리고 END_HEADER flag를 설정해서 header를 다보냈음을 알리고 END_STREAM을 이용해서 모든 데이터를 다 보냈음을 나타내는것은 위의 내용과 비슷하다.

----

### 예를들면..

Stream 1번으로 /index.html 요청이 들어왔다고 가정하자, 그러면 server는 index.html은 style.css가 필요로한다는 사실을 알고 있다(알고 있을것이다!!) 그러면 이때 client에게 PUSH_PROMISE를 1번 stream을 통해서 보낸다.

PUSH_PROMISE의 내용에는 server가 2번 스트림을 열것이고, :path는 /style.css이고 :method는 GET이고 scheme은 https다, authority등 헤더들을 포함한 내용이 들어갈것이다. 그러면 서버는 stream 1번으로 index.html의 요청에 해당하는 응답 헤더와 html내용에 더불어서 stream 2번으로는 /style.css의 응답 header와 내용을 보낼 수 있게된다.

그러면 브라우저가 index.html을 받는가와 동시에 style.css를 받아서 캐싱해두고 index.html를 다 받아서 해석할때 /style.css를 필요로함을 알더라도, 캐시에서 불러서 쓸 수 있다.

### 제약

첫번째로 Push된 데이터는 캐싱할 수 있는 데이터여야한다, 캐싱설정이 되어 있기보다는 이미지나 js, css등 일반적으로 브라우저가 캐싱가능한 데이터여야한다는 뜻으로 해석된다.(실험해봤는데 캐시에 관련된 헤더를 설정하지 않아도 Push된 데이터를 가져다 사용한다.)

또한 예상되는 Request를 보내는 PUSH_PROMISE로 entity를 보낼 수 없다. 따라서 GET 방식으로만이 조건적으로 resource를 선택하는 방법이 될 수 있을것이다.

## 정리하자면

이 블로그에 HTTP/2 Start를 보면 protocol version negotiation에 대한 내용이 있다. TLS를 사용중인 경우엔 ALPN (heuristic으로 주요 브라우저가 NPN을 사용하긴하지만 피하도록하자..) 혹은 사용하고 있지 않은 경우 Upgrade 헤더를 이용해서 negotiation을 한다.

그런뒤에 connection은 지속적으로 유지하는게 client와 server양측에 좋다. 만약 connection이 파기될때에는 RST_STREAM의 NO_ERROR를 이용해서 파기하도록 명시하는데, Frame type에 관한 글이나 표준을 보면 자세히 나와 있다.

또한 TLS 1.2 버전을 쓸것을 강조하고 있다.(아마 heart bleed때문이지 않을까 하는 추측을 해본다.. 안 읽어봐서 모르지만 길게 설명되어 있으니 원문을..)

----

쓸고보니 별로 말할게 없어서(-_-;;)...

추가적인 내용은 여러 루트로 문의해주시면 성실히 포스팅하겠습니다. (구현체는 시중에(?) 돌아다니는게 꽤 있고, 허접하게 python으로 끄적거린 제 소스도 github에 있으니 참조하시면 될것 같습니다.)

P.S.1 그 동안 구현체에 조금 집중하느라... 포스팅이 뜸했는데 더 열심히 써야겠다.
P.S.2 Flow control이라는 매우 특이한 기능이 있는데 이에 관해서도 포스팅할 것이다.