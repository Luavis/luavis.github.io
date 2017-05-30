---
layout: post
title:  "Pex를 이용한 배포"
date:   2017-05-31 01:39:00 +09:00
categories: python
description: Pex를 이용해서 애플리케이션을 배포하는 방법
keywords: python, pex, deploy, flask

---

## tl;dr

`pex`는 Python application을, 하나의 실행파일로 만들어주는 라이브러리입니다. 설치는 pip을 이용하거나 [github.com](https://github.com/pantsbuild/pex)에 있는 manual을 이용해서 빌드 설치도 가능합니다. 간단한 사용법을 살펴보면.

```sh
$ pex requests flask 'psutil>2,<3' -o flask-python
```

위와 같은 방법으로 `requests`와 `flask` 특정 버전의 `psutil`이 기본 설치된 `flask-python`이라는 이름의 python 실행 바이너리를 얻을 수 있습니다. 아래와 같이 위에서 생성한 `flask-python`을 실행하면 requests와 flask가 이미 탑재된 Python Interactive Console을 볼 수 있습니다.

```sh
$ ./flask-python
Python 2.7.13 (default, Dec 18 2016, 07:03:39)
[GCC 4.2.1 Compatible Apple LLVM 8.0.0 (clang-800.0.42.1)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
(InteractiveConsole)
>>>
```

## PEX

최근에 [admission.dimigo.hs.kr](http://admission.dimigo.hs.kr) 사이트를 개발하면서, Python 개발 경험이 없는도 배포된 웹 애플리케이션을 쉽게 사용하는 방법에 대해서 고민하던중 `pex` 프로그램을 알게되었습니다.

Python은 zip 형식의 파일을 실행할 수 있는 기능을 [Python 2.6](http://bugs.python.org/issue1739468)부터 지원했습니다. zip 압축을 해제하고 내부에서 `__main__.py`파일을 찾아서 실행하는 기능입니다. 위 기능을 PEP 문서화하고, 추가 기능을 설명해둔 문서가 [PEP 441](https://www.python.org/dev/peps/pep-0441)에 정리되어 있습니다.

Pex는 zip application 기능과 셔뱅(#!)을 이용해서 조금 더 쉽게 파이선을 패키징해주는 기능을 합니다.

## Install

우선 pex를 설치하는 법을 보겠습니다.

```sh
$ pip install wheel
$ pip install pex
```

> error: invalid command `'bdist_wheel'` 에러가 발생하는 경우 pip을 이용해서 wheel을 설치하여
> `bdist_wheel` 커맨드가 동작할 수 있도록 만들면 됩니다.


## Deploy

우선 위에서 본 pex와 dependency 목록을 입력해주면 된다. 하지만 조금더 효율적인 방법으로는 `requirements.txt`를 사용하는 방법이 있다. -r 플래그를 이용하면 requirements를 읽어올 수 있다.

```sh
$ pex -r requirements.txt
```

그리고 중요한건 현재 작업 중인 프로젝트를 패키지화하여 pex에 각종 dependecy pacakge와 함께 사용할 수 있다는 점입니다. 테스팅을 위해서 현재 간단한 flask 앱을 구현했습니다.

**app.py**

```python
from flask import Flask


app = Flask(__name__)

@app.route('/')
def index():
    return "<h1>Hello world</h1>"


def main():
    app.run()

if __name__ == "__main__":
    main()
```

그리고 프로젝트를 패키징 가능하도록 하기 위해서 setup.py를 작성합니다. 테스트를 위한 프로젝트의 패키지 이름은 pexflask라 지정했습니다.

**setup.py**

```python
import pexflask
from setuptools import setup, find_packages


setup(
    name='pexflask',
    version='0.0.1',
    description='pex flask',
    packages=find_packages(),
    package_dir={'': '.'},
    install_requires=[
        'Flask==0.12',
    ],
)
```

그리고 위의 setup.py와 app.py를 아래 directory 구조에 넣습니다.

```
.
├── pexflask
│   ├── __init__.py
│   └── app.py
└── setup.py
```

이런 상황에서 pex를 이용해서 deploy하기 위해서는 아래와 같은 설정으로 패키징이 가능합니다.

```sh
$ pex . -o pexflask -e pexflask.app:main
```

pex는 현재 디렉토리(위의 .)에서 패키지를 불러오고 `install_requires`를 분석해서 `flask` 0.12버전을 함께 패키징합니다. 그리고 `-e` 플래그를 이용하면 entry point(시작 지점)가 설정 가능합니다(위의 경우 pexflask.app에 main함수를 호출합니다). 또 `-o` 플래그를 이용하면 제작한 결과물이 저장됩니다.

사용해보면서 몇 가지 중요한 플래그를 정리해보면.

* `-v`: verbose 설정입니다. 진행과정을 상세하게 볼 수 있습니다.
* `-f [path/url]`: 해당 경로에서 패키지를 찾습니다.(zip, wheel, tar.gz)등 패키지를 찾는것으로 보입니다.
* `--disable-cache`: 이미 저장된 패키지의 캐시를 사용하지 않습니다. **로컬패키지인 경우** 수정사항이 발생한 경우 캐싱된 데이터로 인해서 반영이 안됩니다. 이런 경우에 사용할 수 있습니다.
* `--python=[python]`: shebang에 들어갈 python을 설정할 수 있습니다. (pypy, python3, python2, ...)

## 실제 사용

위에서 언급한 [admission.dimigo.hs.kr](http://admission.dimigo.hs.kr)을 패키징해보고 사용해보면서 느낀점은, flask앱을 작성하다 보면 당연히 생길 수 밖에 없는 static, assets path나 template path의 관리가 따로 필요한 부분이 있어보인다는 점입니다.
또한 Twitter university의 [발표 자료](https://www.youtube.com/watch?v=NmpnGhRwsu0)에서는  손쉬운 빌드를 위해서는 [pants](https://pantsbuild.github.io/)를 사용하는 방법을 권장합니다. 하지만 개인적으로 빌드를 위해서 다른 패키지를 설치하는 점이 조금 거슬려서, Makefile 혹은 setup.py에 작성하는 방법 등을 생각해보고 있습니다.

## References

* [https://www.youtube.com/watch?v=NmpnGhRwsu0](https://www.youtube.com/watch?v=NmpnGhRwsu0)
* [http://d.hatena.ne.jp/heavenshell/20150907/1441645289](http://d.hatena.ne.jp/heavenshell/20150907/1441645289)
