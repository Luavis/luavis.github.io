---
layout: post
title:  "RFC 1945(HTTP 1.0) 요약上"
date:   2015-07-28 17:20:00
categories: http
description: http의 요약본 上
keywords: http, rfc 1945, http 1.0

---

## HTTP VERSION

---

HTTP 버전은 ```<major version>.<minor version>``` 으로 이루어 진다.

    <minor>가 올라가는 경우는 파싱 알고리즘의 차이는 없고, 헤더의 추가나 기능의 추가를 나타낸다.
    
    <major> 프로토콜의 파싱 알고리즘에 큰 변화가 있을 경우에 올라간다.

HTTP의 버전은 ```"HTTP" "/" "1*DIGIT" . "1*DIGIT"```같은 형식으로 표기한다. 또한,  HTTP/2.4는 HTTP/2.13에 비해 낮은 버전이다 minor version은 소숫점이 아니라 다른 버전으로 읽어야한다.

---
HTTP/1.0 서버는 아래와 같은 사항을 지켜야한다:

- HTTP/0.9 and HTTP/1.0 요청의 Request-Line을 인식 할 수 있어야한다.

- HTTP/0.9 or HTTP/1.0의 요청을 이해할 수 있어야한다.

- client의 요청에 대해 같은 버전으로 올바른 meesage에 응답해야한다.

HTTP/1.0 클라이언트는 아래와 같은 사항을 지켜야한다.:

- HTTP/1.0의 Status-Line을 인식할 수 있어야한다.

- HTTP/0.9나 HTTP/1.0의 응답을 이해할 수 있어야한다.

> 프록시나 게이트웨이는 다른 프로토콜이나 버전을 사용할 수 있지만 client와 server에 요청및 응답에 대해서는 각각의 endpoint가 지원하는 버전으로 다운그레이드와 업그레이드를 지원해 주어야 한다.

## URI

---

*About URI*

       URI            = ( absoluteURI | relativeURI ) [ "#" fragment ]

       absoluteURI    = scheme ":" *( uchar | reserved )

       relativeURI    = net_path | abs_path | rel_path

       net_path       = "//" net_loc [ abs_path ]
       abs_path       = "/" rel_path
       rel_path       = [ path ] [ ";" params ] [ "?" query ]

       path           = fsegment *( "/" segment )
       fsegment       = 1*pchar
       segment        = *pchar

       params         = param *( ";" param )
       param          = *( pchar | "/" )

       scheme         = 1*( ALPHA | DIGIT | "+" | "-" | "." )
       net_loc        = *( pchar | ";" | "?" )
       query          = *( uchar | reserved )
       fragment       = *( uchar | reserved )

       pchar          = uchar | ":" | "@" | "&" | "=" | "+"
       uchar          = unreserved | escape
       unreserved     = ALPHA | DIGIT | safe | extra | national

       escape         = "%" HEX HEX
       reserved       = ";" | "/" | "?" | ":" | "@" | "&" | "=" | "+"
       extra          = "!" | "*" | "'" | "(" | ")" | ","
       safe           = "$" | "-" | "_" | "."
       unsafe         = CTL | SP | <"> | "#" | "%" | "<" | ">"
       national       = <any OCTET excluding ALPHA, DIGIT, reserved, extra, safe, and unsafe>
       
URI에 대한 정확한 spec은 [RFC 1738](https://www.ietf.org/rfc/rfc1738.txt)와 [RFC 1808](https://www.ietf.org/rfc/rfc1808.txt)에 나와 있다.
       
*HTTP URL Form*

       http_URL       = "http:" "//" host [ ":" port ] [ abs_path ]

       host           = <A legal Internet host domain name
                         or IP address (in dotted-decimal form),
                         as defined by Section 2.1 of RFC 1123>

       port           = *DIGIT

포트에 대한 언급이 없다면 80번 포트로 간주하고, 대부분 TCP connection으로 동작하지만, 아닌 경우에는 URI scheme을 다르게 표기해주어야한다. 만약 abs_path가 없다면 "/"로 간주해야 한다.

## Date/Time Formats

---

*Support date format*

       Sun, 06 Nov 1994 08:49:37 GMT    ; RFC 822, updated by RFC 1123
       Sunday, 06-Nov-94 08:49:37 GMT   ; RFC 850, obsoleted by RFC 1036
       Sun Nov  6 08:49:37 1994         ; ANSI C's asctime() format


*HTTP date*

       HTTP-date      = rfc1123-date | rfc850-date | asctime-date

       rfc1123-date   = wkday "," SP date1 SP time SP "GMT"
       rfc850-date    = weekday "," SP date2 SP time SP "GMT"
       asctime-date   = wkday SP date3 SP time SP 4DIGIT

       date1          = 2DIGIT SP month SP 4DIGIT
                        ; day month year (e.g., 02 Jun 1982)
       date2          = 2DIGIT "-" month "-" 2DIGIT
                        ; day-month-year (e.g., 02-Jun-82)
       date3          = month SP ( 2DIGIT | ( SP 1DIGIT ))
                        ; month day (e.g., Jun  2)

       time           = 2DIGIT ":" 2DIGIT ":" 2DIGIT
                        ; 00:00:00 - 23:59:59

       wkday          = "Mon" | "Tue" | "Wed"
                      | "Thu" | "Fri" | "Sat" | "Sun"

       weekday        = "Monday" | "Tuesday" | "Wednesday"
                      | "Thursday" | "Friday" | "Saturday" | "Sunday"

       month          = "Jan" | "Feb" | "Mar" | "Apr"
                      | "May" | "Jun" | "Jul" | "Aug"
                      | "Sep" | "Oct" | "Nov" | "Dec"

첫번째 date 표기 방식이 가장 기본적인 표기 방식이고 만약 두번째, 세번째로 요청이나 응답을 받았다 해도, 다음 요청에서는 첫번째 date으로 보내고 받아야한다.

## Charset

---

HTTP는 MIME TYPE에 정의된 문자 인코딩을 사용한다. HTTP의 문자셋 정리는 case insensitive하게 받아드린다.(대소문자 상관 없음)

     charset = "US-ASCII"
             | "ISO-8859-1" | "ISO-8859-2" | "ISO-8859-3"
             | "ISO-8859-4" | "ISO-8859-5" | "ISO-8859-6"
             | "ISO-8859-7" | "ISO-8859-8" | "ISO-8859-9"
             | "ISO-2022-JP" | "ISO-2022-JP-2" | "ISO-2022-KR"
             | "UNICODE-1-1" | "UNICODE-1-1-UTF-7" | "UNICODE-1-1-UTF-8"
             | token
             
반면 HTTP는 어떤 charset이든 IANA Character Set에 정의되어 있으면 사용할 수 있다. 만약 charset에 대해서 표기가 없다면, US-ASCII or ISO-8859-1로 간주한다.

## Content coding

---

content coding은 무손실 압축으로 data를 압축하는것을 말한다.

content-coding = "x-gzip" | "x-compress" | token

Note: 향후 호환성을 위해서, HTTP/1.0에서는 "gzip"과 "compress" to 각각 "x-gzip"과 "x-compress"로 해석해야한다.


    x-gzip
       An encoding format produced by the file compression program
       "gzip" (GNU zip) developed by Jean-loup Gailly. This format is
       typically a Lempel-Ziv coding (LZ77) with a 32 bit CRC.

    x-compress
       The encoding format produced by the file compression program
       "compress". This format is an adaptive Lempel-Ziv-Welch coding
       (LZW).

content-coding에 어떻게 표기되어 있는가보다, 이 표기가 어떤 알고리즘으로 encoding을 decoding 해주는지가 더 중요하다.

> Note:
>
> 프로그램 이름을 encoding formate으로 사용하는 것은 하지 말아야한다. 

## Media Types

---


       media-type     = type "/" subtype *( ";" parameter )
       type           = token
       subtype        = token
       
       parameter      = attribute "=" value
       attribute      = token
       value          = token | quoted-string

type과 subtype그리고 parameter의 이름은 대소문자를 구별하지 않지만, parameter의 value는 이를 구분한다.

LWS(공백문자) type과 subtype혹은 paramter의 이름과 값사이에 존재하면 안된다.

media type에 대해서는 [RFC 1590](https://www.ietf.org/rfc/rfc1590.txt)에 정의되어 있는 방식으로 정의된 것을 사용한다. 등록되지 않은 형식의 media type은 사용이 권장되지 않는다.

## About Text

---
text타입의 subtype들은 CRLF를 라인 구분자로 사용해야한다.

HTTP는 **Entity-Body**의 text에 한하여 CR이나 LF만 단독으로 라인 구분자로 사용하는 text도 허용한다.

13과 10은 CR과 LF를 의미하지만 그렇지 안은 경우에도(e.g multibyte 문자셋) **Entity-Body** 내 라면 신경 쓰지 않는다.

만약 media 타입에 따로 병기되어 있지 않다면, 기본 charset은 ISO-8859-1이다.

media 타입에 정의되어 있는 charset parameter는 charater set을 나타낸다.

## Multipart

---

multipart는 하나의 Entity-Body에서 여러가지 데이터를 한번에 보내고 싶을 때 사용한다. 이는 MIME에 정의되어 있는 multipart 타입을 사용하는데 대부분의 multipart는 boundary를 사용하고 이는 HTTP header에 병기한다.

   
## product token

---   

제품의 토큰은 User-Agent나 Server같은 헤더에 탑재하여 보낼 수 있고, 간단하게 하여 보내야한다.

    User-Agent: CERN-LineMode/2.15 libwww/2.17b3
    
    Server: Apache/0.8.4

## Message

---

       HTTP-message   = Simple-Request           ; HTTP/0.9 messages
                      | Simple-Response
                      | Full-Request             ; HTTP/1.0 messages
                      | Full-Response

       Full-Request   = Request-Line             ; Section 5.1
                        *( General-Header        ; Section 4.3
                         | Request-Header        ; Section 5.2
                         | Entity-Header )       ; Section 7.1
                        CRLF
                        [ Entity-Body ]          ; Section 7.2

       Full-Response  = Status-Line              ; Section 6.1
                        *( General-Header        ; Section 4.3
                         | Response-Header       ; Section 6.2
                         | Entity-Header )       ; Section 7.1
                        CRLF
                        [ Entity-Body ]          ; Section 7.2
                        
        Simple-Request  = "GET" SP Request-URI CRLF

        Simple-Response = [ Entity-Body ]
        
        
*Message header*

       HTTP-header    = field-name ":" [ field-value ] CRLF

       field-name     = token
       field-value    = *( field-content | LWS )

       field-content  = <the OCTETs making up the field-value
                        and consisting of either *TEXT or combinations
                        of token, tspecials, and quoted-string>

*General header*

       General-Header = Date                     ; Section 10.6
                      | Pragma                   ; Section 10.12
                      
General header의 헤더 이름은 프로토콜의 버전에 따라서 달라질 수 있다.

*Method*

       Method         = "GET"                    ; Section 8.1
                      | "HEAD"                   ; Section 8.2
                      | "POST"                   ; Section 8.3
                      | extension-method

       extension-method = token

       Request-Header = Authorization            ; Section 10.2
                      | From                     ; Section 10.8
                      | If-Modified-Since        ; Section 10.9
                      | Referer                  ; Section 10.13
                      | User-Agent               ; Section 10.15

