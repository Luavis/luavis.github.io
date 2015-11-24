---
layout: post
title:  "Golang 탐방.."
date:   2015-11-25 03:09:00
categories: golang
description: Python코드를 golang으로 바꾸기
keywords: go, google, golang

---

*Golang을 배워보고 싶어졌습니다!!* 이유는 별거 없습니다. strict type이고 그러면서도 유연해 보이고, 성능도 어느정도 받쳐주고 무엇보다 구글이 support하고 있다는점이 마음에 들어서였습니다..

Golang을 배우려면 우선 go 컴파일러를 설치해야겠지요. OS X에서는 brew를 이용해서 비교적 손쉽게 설치할 수 있었는데, 이는 다른 블로그에 자료가 많으니 참고하면 될 듯 합니다.

개인적으로 언어를 배울때는 무언가 만들면서 배우기 때문에, 이 글에서는 그 대상으로 예전에 만들어둔 [autopocker.py](https://gist.github.com/Luavis/10089608)를 golang으로 포팅해가는 과정을 통해서 배워보기로 했습니다.


## 기본적인 문법과 사용법


우선 golang은 C언어와 유사하게 main함수에서 시작합니다.

{% highlight go linenos %}
package main

func main() {
	// ...
}

{% endhighlight %}

특이한점은 main함수는 no argument no return type이라는 점입니다. 대부분의 C언어 컴파일러는 이 사항을 유연하게 처리하는 반면 golang에서는 이를 철저하게 지키고 있습니다. package는 자바의 그 패키지 개념과 비슷하게 접근하면 될 것 같습니다. package는 main이여야만 실행가능한 package가 된다고 합니다.

그리고 우리에게 또 중요한것은 외부모듈을 include하는 것이죠, Golang에서는 python의 import와 조금 비슷하면서 다른 문법을 사용합니다.

{% highlight go linenos %}

import "fmt"

{% endhighlight %}

package 이름에는 ```"```가 꼭 들어가야하며 하위 항목은 디렉토리 구조로 구분되며(이 부분도 파이썬과 비슷합니다. 다만 ```__init__.py```가 없다는거 정도..) 이를 대해서는 ```/ ```로 구분합니다.

{% highlight go linenos %}

import "net/http"

{% endhighlight %}

또 한번에 여러개의 모듈을 import하게되면 ```()```로 묶어서 표현합니다.

{% highlight go linenos %}

import (
	"net/http"
	"fmt"
)

{% endhighlight %}

이 괄호는 어떤 키워드를 중복으로 적용할 때 사용됩니다. 예를들어 여러개의 상수를 선언할때에, const를 이용하여 선언 할 수 있는데,

{% highlight go linenos %}

const (
	a string = "Hello"
	b string = "World"
)
{% endhighlight %}

이런 형식으로 표기하게 됩니다. 이와 반대로 변수를 선언할 때에는 

{% highlight go linenos %}

var (
	a string = "Hello"
	b string = "World"
)

// or
var c = "~~"
d := "!!"
{% endhighlight %}

이렇게 선언할 수 있습니다.

특이한 점들 중 하나는 Golang은 pointer 개념이 있고, ```'```와 ```"```는 C언어와 같이 다른의미를 갖습니다 전자의 경우 char를 의미하며, 후자는 string을 의미합니다.

함수는 parameter type과 return type개념을 갖고 있기 때문에, 이를 정확히 명시해주어야하는데 최신 언어들이 지향하는 바와 비슷하게 변수 타입을 오른쪽에 적는데, return type또한 오른쪽에 적습니다. [(잘모르겠지만 이게 고전적 방식에 비해서 읽기 쉽다고 합니다.)](http://blog.golang.org/gos-declaration-syntax)

{% highlight go linenos %}

func add(a, b int) int {
    return a + b
}

func swap(a , b int) (x, y int) {
    return b, a
}

{% endhighlight %}

위와 같이 여러개일 경우 생략이 가능하고, 또한 tuple과 같은 형식으로 return도 가능하다. 좀 더 swap을 swap답게 쓰기 위해선 포인터를 이용해서 call-by-reference를 호출해야하는데,

{% highlight go linenos %}

func swap(a , b *int) {
    *b, *a = *a, *b
}

{% endhighlight %}

포인터와 변수 swap기능을 이용해서 이렇게도 사용가능 합니다.

if문이 있는데 조금 특이한점은

{% highlight go linenos %}

if str, ok := value.(string); ok {
    return str
} else if str, ok := value.(Stringer); ok {
    return str.String()
}

{% endhighlight %}

이런 식으로 실행한 결과를 변수에 담고 그를 조건으로 사용할 수 있습니다.

while이라고 하는 키워드가 없고 모든 반복문은 for 키워드로 처리합니다.
{% highlight go linenos %}

// C style for loop
for init; condition; post {}

// while condition with
for condition {}

// infinite loop
for {}
{% endhighlight %}

비교적 최신 언어들에서 흔하게 지원하고 있는 foreach구문도 지원하는데요,

{% highlight go linenos %}

msgs := []string{"Hello", "World"}

// foreach loop
for i, s := range msgs {
	println(i) // print index
	println(s) // print value
}

{% endhighlight %}

위와 같이 지원합니다. 기본적인 자료타입으로 map또한 지원합니다.

{% highlight go linenos %}

msgs := map[string]int{"H": 1, "e": 2}

// foreach loop
for k, v := range msgs {
	print(k + ": ")
	println(v)
}

{% endhighlight %}

위와 같이 사용할 수 있고 key값과 value값을 아까 봤던 foreach문을 통해서 반복문 설정이 가능합니다.

---

이제 가장 중요한 3rd party 모듈 사용법인데, 개발자는 혼자 개발할 수 없기에... 3rd party모듈을 끌어다가 쓰는게 당연한 일입니다.

Go lang은 module의 install path를 ```$GOPATH```를 이용해서 특정지점으로 정할 수 있다. bashrc같은 shell 설정파일에 export해두어서 환경변수를 설정해두면, ```go get``` 명령어로 외부모듈 설치시 해당 directory에 설치하게 됩니다.

예를들어 surf란 모듈을 설치한다면,

```
$go get github.com/headzoo/surf
```

이렇게 command를 사용하여 설치가 가능합니다. 그리고 설치한 외부 모듈은 

{% highlight go linenos %}

import "github.com/headzoo/surf"
{% endhighlight %}

이렇게 불러서 사용할 수 있습니다. 그럼 go는 ```$GOPATH```에서 pkg directory에 있는 모듈들을 읽어들여 링크할 것입니다.

## 번역번역

이제 본격적으로 autopoker.py를 번역해보겠습니다.

{% gist Luavis/10089608 %}

python으로 작성해두었던 코드는 위와 같습니다, 1년전에 작성한 코드여서 정확히 모르겠지만 우선 mechanize를 이용해서 web content를 crawling했고, 이 모듈을 통하여 login까지 성공 시키고 데몬등을 붙혀 서버에서 동작할 수 있게 작성했습니다. 그래서 찾아보았던 mechanize와 비슷한 기능을 하는 surf라는 모듈을 발견했고, 이를 사용해볼 생각입니다.

우선 surf를 go get 명령어로 설치했고, 이를 이용해서 간단하게 페이지의 Titile가져오는 예제를 그대로 적용해보았습니다.

{% highlight go linenos %}


package main

import (
    "github.com/headzoo/surf"
)

func main() {
    browser := surf.NewBrowser()
    err := browser.Open("http://b.luavis.kr")

    if err != nil {
        panic(err)
    } else {
        print(browser.Title())
    }

}

{% endhighlight %}

```
$ go run autopoker.go
Luavis' Dev story
```

아주 잘 동작합니다. 여러가지 문서를 참고하고 노력을 해서 전체를 번역해보았습다.

{% gist Luavis/6d4691c1c4a28cab99a8 %}

몇 가지 해석을 달아보면 flag라는 모듈은 기본 모듈로 python에서 argparse와 같은 모듈인 듯 합니다. 그리고 flag.PrintDefaults 함수를 통해서 help메세지를 띄울 수 있고, ```:=```과 ```=```에는 큰 차이가 있습니다. ```=```는 하나의 연산자로 받아들이는 반면에 ```:=```는 하나의 syntax인 듯 합니다.([Short variable declarations](https://golang.org/ref/spec#Short_variable_declarations)) 의미 자체는 새로운 변수를(not const) 선언하는데 타입이나 var 키워드가 없어도 됩니다.(없어야되는거 같다 있으면 syntax error가 발생하니)

그리고 unused variable은 굉장히 민감한 사항인듯합니다.(go run으로 실행시 실행이 되지 않습니다) 이는 ``` _``` 이름의 익명변수를 이용할 수 있습니다. 그리고 기본모듈로 List를 지원하며, 이때 Element에는 Value라고 하는 interface{} 가 있습니다. 이는 golang에서 굉장히 많이 사용하는데 타입이 애매한 경우에 사용합니다.(Objective-C의 id type). 우선 이것에 대해서 설명하려면 길어지니 사용법 부터 보면 값을 받고 line 62의 ```e.Value.(string)```와 같이 type casting이 가능합니다.

------

다음에는 go routine과 defer interface channel과 같이 golang에 특징적인 기능들에 대해서 블로깅 해보고 간단한 HTTP서버를 작성해보겠습니다.
