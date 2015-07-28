---
layout: post
title:  "RFC 1945(HTTP 1.0) 요약 下"
date:   2015-07-28 18:07:00
categories: http
description: http의 요약본 下
keywords: http, rfc 1945, http 1.0

---

## Request

---

*Request-URI*

    Request-URI    = absoluteURI | abs_path
    
여기서 absoluteURI는 상편에 정의되어 있지만 ```absoluteURI    = scheme ":" *( uchar | reserved )```를 말한다.
따라서 Request-URI는 다음과 같은 형식을 말할 수 있지만,

    GET http://www.w3.org/pub/WWW/TheProject.html HTTP/1.0
    
일반적으로는 아래와 같이 사용한다.

    GET /pub/WWW/TheProject.html HTTP/1.0
    
Request-URI에 다른 인코딩이 된 문자를 옮기고 싶다면 percent encdoing을 하면 되는데 형식은 ```% HEX HEX``` 형식으로 사용하면 된다. 이는 [RFC 1738](http://www.isi.edu/in-notes/rfc1738.txt)에 정의 되어있다. 

*Request Header Fields*

       Request-Header = Authorization            ; Section 10.2
                      | From                     ; Section 10.8
                      | If-Modified-Since        ; Section 10.9
                      | Referer                  ; Section 10.13
                      | User-Agent               ; Section 10.15

위의 request header들은 request의 modifier 역활을 할 수 있다. Request header로는 위와 같은 헤더를 사용할 수 있지만, protocol version에 따라 변경될 수 있다.

## Response

---


    Response        = Simple-Response | Full-Response

    Simple-Response = [ Entity-Body ]
    
    Full-Response   = Status-Line             ; Section 6.1
                     *( General-Header       ; Section 4.3
                     | Response-Header      ; Section 6.2
                     | Entity-Header )      ; Section 7.1
                     CRLF
                     [ Entity-Body ]         ; Section 7.2

Response는 header 필드 없이도 작동하는 Simple Response라는 항목이 있다. 이는 HTTP/0.9모드에서 동작한다. 만약 client의 protocol 버전이 0.9라면 Simple-Response로 응답해야한다, 이 때 midea type은 text/html으로 생각한다.


*Status Line* 

    "HTTP/" 1*DIGIT "." 1*DIGIT SP 3DIGIT SP

*Status code*

    o 1xx: Informational - Not used, but reserved for future use

    o 2xx: Success - The action was successfully received,
                     understood, and accepted.

    o 3xx: Redirection - Further action must be taken in order to
                         complete the request

    o 4xx: Client Error - The request contains bad syntax or cannot
                          be fulfilled

    o 5xx: Server Error - The server failed to fulfill an apparently
                          valid request

    Status-Code    = "200"   ; OK
                  | "201"   ; Created
                  | "202"   ; Accepted
                  | "204"   ; No Content
                  | "301"   ; Moved Permanently
                  | "302"   ; Moved Temporarily
                  | "304"   ; Not Modified
                  | "400"   ; Bad Request
                  | "401"   ; Unauthorized
                  | "403"   ; Forbidden
                  | "404"   ; Not Found
                  | "500"   ; Internal Server Error
                  | "501"   ; Not Implemented
                  | "502"   ; Bad Gateway
                  | "503"   ; Service Unavailable
                  | extension-code

    extension-code = 3DIGIT

    Reason-Phrase  = *<TEXT, excluding CR, LF>

*Response header*

    Response-Header = Location                ; Section 10.11
                   | Server                  ; Section 10.14
                   | WWW-Authenticate        ; Section 10.16
                   


## Entity

---

Full-Request와 Full-Response는 entity를 주고 받는다. entity는  Entity-Header와  Entity-Body를 포함하고 있다.

    Entity-Header  = Allow                    ; Section 10.1
                  | Content-Encoding         ; Section 10.3
                  | Content-Length           ; Section 10.4
                  | Content-Type             ; Section 10.5
                  | Expires                  ; Section 10.7
                  | Last-Modified            ; Section 10.10
                  | extension-header

    extension-header = HTTP-header

Entity-Header는 Entity의 Metadata에 대해 가지고 있다.

    Entity-Body    = *OCTET

Entity-Body는 실질적인 data에대해 나타낸다. Entity-Body의 사이즈는 Content-Length에 정의된 크기 만큼의 data를 읽어와야한다.

*Entity body type*

    entity-body := Content-Encoding( Content-Type( data ) )

Content-Type을 통해서 읽고 Simple-Response이변 URL의 확장자로 찾는다. 이런 과정에도 여전히 알 수 없는 타입에 대해서는 type을 application/octet-stream로 취급한다.

## Method Definitions

- GET : Request-URI가 가르키고 있는 정보를 받아온다는 의미이다. If-Modified-Since가 있는 GET은 Conditinoal GET으로 의미가 변경된다. 이는 네트워크의 사용률을 낮추기위한 방법으로 If-Modified-Since 이후에 값이 변경된 적이 없다면, 이를 캐쉬된 entity를 사용한다.

- HEAD : GET과 같지만 server는 Entity-Body를 포함해서 응답을 보내면 안된다.

- POST : 서버는 요청에 포함된 entityfmf Request-URI로 저장한다. 이 요청을 받을때 다음과 같은 기능이 가능해야한다 :
    + 이미 존재하는 resource임을 알림
    
    + 게시판 뉴스그룹 이메일 리스트 등에 새로운 메세지를 포스팅한다.

    + posting의 결과에대해서 보내주어야한다.

    + 포함되어있는 동작을 통하여 데이터베이스에 추가해야한다.

## Header Field Definitions

- *Allow* : 해당 Request-URI에서 지원하는 method에대해서 서술한다. (e.g Allow: GET, HEAD)

- *Authorization* : 서버에 의해 401 응답을 받은 user-agent가 해당 Request-URI에 인증을 요청할때 사용된다.

- *Content-Encoding* : Entity-Body의 압축형식에 대해 서술한다.

- *Content-Length* : Entity-Body의 크기에 대해 서술한다. (e.g Content-Length: 3495)

- *Content-Type* : Entity-Body의 타입에 대해서 서술한다. (e.g Content-Type: text/html)

- *Date* : HTTP의 message가 출발한 시간을 나타낸다.

- *Expires* : 언제 entity가 폐기되어야하는지에대해서 date/time으로 적혀있다. application은 해당 날짜 이후에는 해당 entity를 더 이상 사용하면 안 된다. (e.g Expires: Thu, 01 Dec 1994 16:00:00 GMT)

- *From* : 어떤 사람이 이 user agent를 사용하고 있는지에 대해서 email 주소를 적어둔다. (e.g From: webmaster@w3.org)

- *If-Modified-Since* : user-agent가 해당 날짜 이후에 entity가 변경된 적이 있는지에 대해서 물어보고 변경된 사항이 없다면 304로 서버는 응답하게 된다. 변경된 사항이 있다면 새로운 entity를 내려준다.

- *Last-Modified* : server가 user-agent에게 최근 수정 날짜를 업데이트 시켜주기 위해 보낸다.

- *Location* : 3xx 응답에 대해서 어떤 URL로 응답을 다시 보내야하는지에 대해서 absoluteURI로 나타낸다. (e.g Location: http://www.w3.org/hypertext/WWW/NewLocation.html)

- *Pragma* : 모든 Pragma는 특정한 추가적인 동작을 가르킨다.

    ```Pragma           = "Pragma" ":" 1#pragma-directive```
    
    ```pragma-directive = "no-cache" | extension-pragma```
    
    ```extension-pragma = token [ "=" word ]```

- *Referer* : 현재 Reuqets-URI가 어디에 종속되어서 왔는지에 대해서 표시하고 있다. 아래와 같은 형식으로 적고, 이를 통해서 서버는 사용자가 어떤 link를 타고 왔는지에 대해서 알 수 있다.

    ```Referer        = "Referer" ":" ( absoluteURI | relativeURI )```

- *Server* : 서버에 관한 정보에대해서 서술한다.

- *User-Agent* : user-agent에 대한 정보에 대해서 서술한다.

- *WWW-Authenticate* : 이 헤더는 401 응답에 대해서만 보내져야한다.

    ```"WWW-Authenticate" ":" 1#challenge```
    
    다음과 같은 형식으로 보내져야하고, 여기서 challenge는 아래를 말한다:
    
    ```challenge      = auth-scheme 1*SP realm *( "," auth-param )```
    
    ```realm          = "realm" "=" realm-value```
    
    ```realm-value    = quoted-string```
    

## Authenticate

유저는 각각의 realm에 대해서 user-id와 password 를 입력해야하고, 401 응답에대한 재 요청시에는 base 64 포맷으로 보내게 되는데, 예를 들어 : 

    WWW-Authenticate: Basic realm="WallyWorld"
위와 같은 형식의 header가 서버로 부터 전송이 되고 user-agent는 이에 대해서

    basic-credentials = "Basic" SP basic-cookie
    basic-cookie      = <base64 [5] encoding of userid-password,
                          except not limited to 76 char/line>
    userid-password   = [ token ] ":" *TEXT

이때 user-id가 Aladdin이고, "open sesame"가 비밀번호라 한다면 아래와 같은 헤더를 재 요청하면 된다:

    Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==


# Additional Features

모든 HTTP/1.0 Application에서 동작한다고 장담은 안되는 기능이지만 부록에 포함되어 있다.

## Additional Request Methods

- PUT : POST와 같이 entity-body를 해당 Request-URI에 저장하는 기능이지만, 이미 파일이 존재한다면, 새로운 버전의 파일이라 인식하고 덮어쓴다.

- DELETE : Request-URI에 해당하는 파일을 삭제한다.

- LINK : 이미 존재하는 resource와 링크를 생성한다.(리눅스의 symbol이나 윈도우 환경의 바로가기 같은 기능을 말하는듯 하다.)

- UNLINK : 위에서 언급한 LINK를 삭제한다.


## Additional Header Field Definitions

- Accept : 이 헤더가 request 헤더로 사용될 때에는 response에 대해서 이해가능한 타입에 대해 user-agent가 미리 MIME으로 설정한다. ```*/*```는 모든 타입을 의미하고, ```type/*```는 type밑에 있는 모든 subtype에 대해서 받을 수 있음을 나타낸다.

- Accept-Charset :  user-agent가 해석할 수 잇는 charset에 대해서 미리 정해놓은 헤더이다. 기본값은 US-ASCII와 ISO-8859-1이다.

- Accept-Encoding : Accept 헤더와 비슷하지만, content-coding에 대해서 제한하는 헤더이다.

- Accept-Language : Accept 헤더와 비슷하지만, 사용자가 받아드릴 수 있는 언어에 대하여 서술해놓은 헤더이다. 

- Content-Language : Response에서 Entity-Body의 언어가 어떤 언어로 설정 되어 있는지에 대해서 서술하고 있다.

- Link : 어떤 value와 link를 할 지에 대해서 적어 놓는 헤더이다.

- MIME-Version : 어떤 MIME Version을 사용하고 있는지 서술한다.

- Retry-After : 503 헤더에 포함되어 잠시후 재요청을 원할 때 적어둔다. 초 단위로 10진수로 적는다.

- Title : entity의 제목에 대해서 적어두는 header다.

- URI : Request-URI의 리소스가 인식할 수 있는 URI에 대해서 서술해둔다.(어떤 기능인지 정확히 모르겠다.) 해당 URI에 접근 가능한지는 보장되지 않는다.
