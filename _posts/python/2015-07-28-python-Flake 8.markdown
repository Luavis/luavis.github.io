---
layout: post
title:  "Python Flake 8 for Sublime Text"
date:   2015-07-28 16:50:00
categories: python
description: Python flake 8 Lint in Sublime Text
keywords: Python, flake 8, PEP 8

---

Python 코드 작성 시 일반적인 컨벤션에 대해서 서술하고 있는 [PEP 8](https://www.python.org/dev/peps/pep-0008/)에 대해서 한번 읽어보는게 좋다.
하지만 이걸 외우면 좋겠지만 사람인지라 실수를 할 수도 있어, 그걸 잡아주는 유틸인 Flake8이 있다.

> Note:
>
> 이런 기능을 하는 유틸리티에는 PyFlakes 외에 PyLint PyChecker등 여러가지 lint 유틸리티가 존재한다.


Flake8은 여러가지 에디터 플러그인 형태로 지원하지만, 제가 주로 사용하고 있는 에디터인 Sublime Text 3에서의 설치법과 사용법에 대해서 포스팅 해보았다.

## 설치

우선 Sublime Text에서는 [Flake8Lint](https://github.com/dreadatour/Flake8Lint)라는 플러그인이 가장 유명한듯하다(?)
wbond의 Package Control이 설치되어 있다면, Super + Shift + P를 이용하여 "Package Control: Install Package"를 입력하여 설치가능한 플러그인 목록을 로딩하고, "Flake8 Lint"를 선택하여 설치한다.

물론 Manual 설치도 가능하다, Sublime Text의 Packages 디렉토리에 ```git clone git://github.com/dreadatour/Flake8Lint.git "Python Flake8 Lint"```, git clone 명령어 혹은 github에서 download zip으로 받은 파일을 올려두는 방식으로도 설치가 가능하다.

----

## 설정

    {
        // 파일 저장 시 flake 8을 실행한다.
        "lint_on_save": true,
        // 파일을 불러올때 flake 8을 실행한다.
        "lint_on_load": false,

        // lint를 라이브로 진행함.(설정된 지연시간 마다 실행함.)
        // sublime text 2에서는 퍼포먼스 문제가 있으니 주의를..
        "live_mode": false,
        // 라이브 모드의 딜레이
        "live_mode_lint_delay": 1000,

        // 최대 글자 수가 어디까지인지 보여주는 설정이다.
        "set_ruler_guide": false,

        // 문제가 발생시 popup을 띄울지
        "popup": true,
        // 문제되는 라인을 highlight 할지
        "highlight": true,

        // highlight 타입:
        // - "line" 전체 라인을
        // - "error" 에러부분만
        "highlight_type": "error",

        // 각종 색상 설정
        "highlight_color_critical": "#981600",
        "highlight_color_error": "#DA2000",
        "highlight_color_warning": "#EDBA00",

        // 에러나 경고 시 gutter에 표기될 모양
        // - "dot", "circle" or "bookmark" to show marks
        // - "theme-alpha", "theme-bright", "theme-dark", "theme-hard" or "theme-simple" to show icon marks
        // - "" (빈 문자) 로 설정시 아무것도 안 뜸
        "gutter_marks": "theme-simple",

        // success도 report 할 지
        "report_on_success": false,

        // success시 gutter에 마크들이 반짝일지.(체크 표시가 반짝한다.)
        // Sublime text 2에서는 퍼포먼스 문제가 있으니 이것도 주의를..
        "blink_gutter_marks_on_success": true,

        // ("~/.config/flake8")를 불러올지?
        "use_flake8_global_config": true,
        // 프로젝트의 pep 설정을 읽어 올지 (i.e. "tox.ini", "setup.cfg" and ".pep8" files)
        "use_flake8_project_config": true,

        // python의 interpreter 설정 (lint files for python >= 2.7):
        // - 'internal' for use internal Sublime Text interpreter (2.6)
        // - 'auto' for search default system python interpreter (default value)
        // - absolute path to python interpreter for define another one
        //   use platform specific notation, i.e. "C:\\Anaconda\\envs\\py33\\python.exe"
        //   for Windows or then "/home/whatever/pythondist/python" for Unix
        "python_interpreter": "auto",

        // python의 내부 함수 리스트 (like '_')
        "builtins": [],

        // pyflakes error lint를 표시할지
        "pyflakes": true,
        // pep8 error lint를 표시할지
        "pep8": true,
        // pep257 error lint를 표시할지
        "pep257": false,
        // 이름의 error lint를 표시할지
        "naming": true,
        // 복잡도 설정 (set number > 0 to check complexity level), if문이나 for문등을 얼마나 내려쓰는것까지 허용하는지
        "complexity": -1,

        // 라인의 최대 길이 기본이 79자
        "pep8_max_line_length": 79,

        // 에러와 경고 설정 (e.g. ["E", "W6"])
        "select": [],
        // 무시할 경고와 에러 설정 (e.g. ["E303", "E4", "W"])
        "ignore": [],

        // 무시할 파일 이름: ["*.mako", "test*.py"]
        "ignore_files": []
    }


원하는데로 적당히 커스텀해서 사용하면 될 듯 하다.
lint가 라이브 모드나 혹은 저장시 자동 로딩 상태가 아니라면, Super + Control + 8 (Windows: Ctrl+Alt+Shift+8, Linux: Ctrl+Alt+8)로 lint를 실행할 수 있다.