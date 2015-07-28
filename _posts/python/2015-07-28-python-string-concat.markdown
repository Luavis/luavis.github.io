---
layout: post
title:  "Python string concat"
date:   2015-07-28 16:09:00
categories: python
description: string concat benchmark
keywords: python, string, concat

---

Python으로 string concat할 일이 많아 질 것으로 보여서 미리 찾아 봤는데, 역시나 str 객체에 ```+=``` 연산자로 concat하는 방식은 객체를 계속 재생산하는 방식이다..

사이트를 뒤져보니 여러 제안이 있고 테스트 코드도 작성되어 있어서 조금 커스텀해서 작성했다.

{% highlight python linenos %}
from cStringIO import StringIO
from UserString import MutableString
from array import array

import sys, timeit

def method1():
    out_str = ''
    for num in xrange(loop_count):
        out_str += `num`
    return out_str

def method2():
    out_str = MutableString()
    for num in xrange(loop_count):
        out_str += `num`
    return out_str

def method3():
    char_array = array('c')
    for num in xrange(loop_count):
        char_array.fromstring(`num`)
    return char_array.tostring()

def method4():
    str_list = []
    for num in xrange(loop_count):
        str_list.append(`num`)
    out_str = ''.join(str_list)
    return out_str

def method5():
    file_str = StringIO()
    for num in xrange(loop_count):
        file_str.write(`num`)
    out_str = file_str.getvalue()
    return out_str

def method6():
    out_str = ''.join([`num` for num in xrange(loop_count)])
    return out_str

def method7():
    out_str = ''.join(`num` for num in xrange(loop_count))
    return out_str

def method8():
    out_str = bytearray()
    for num in xrange(loop_count):
        out_str += `num`
    return out_str


loop_count = 80000

print sys.version

print 'method1=', timeit.timeit(method1, number=10)
print 'method2=', timeit.timeit(method2, number=10)
print 'method3=', timeit.timeit(method3, number=10)
print 'method4=', timeit.timeit(method4, number=10)
print 'method5=', timeit.timeit(method5, number=10)
print 'method6=', timeit.timeit(method6, number=10)
print 'method7=', timeit.timeit(method7, number=10)
print 'method8=', timeit.timeit(method8, number=10)
{% endhighlight %}

결과를 확인해보면, 

    [GCC 4.2.1 Compatible Apple LLVM 6.0 (clang-600.0.39)]
    method1= 0.145534038544
    method2= 15.9896481037
    method3= 0.312026977539
    method4= 0.139698982239
    method5= 0.353417873383
    method6= 0.0955619812012
    method7= 0.106313943863
    method8= 0.101000070572

이런식인데, ```MutableString```은 2.6버전에서 이미 deprecated된 방식이라 하니 사용하지 않아야하고, method 6이 가장 빠르다는 결과가 나왔지만 6, 7, 8정도에서 취향에 따라 해도 큰 상관 없을듯하다..
