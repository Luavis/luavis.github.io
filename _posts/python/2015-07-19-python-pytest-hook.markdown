---
layout: post
title:  "Python pytest hook"
date:   2015-07-19 18:49:00
categories: python
description: pytest hook
keywords: pyetst, hook

---

![pytest]({{ site_url }}/assets/pytest.png)

이번 문서에서는 Pytest의 hook 기능에 대해서 알아보고자 Pytest 공식 사이트의 latest 버전의(2.4) [hook reference 페이지](https://pytest.org/latest/plugins.html#pytest-hook-reference)를 번역해 보기로 했다.

> Note:
>
> Hook 함수들은 conftest.py에 추가해야 동작한다.


*이 외의 pytest 관련 문서*

1. [Python fixture]({% post_url /python/2015-07-19-python-pytest-fixture %})
1. [Pytest with unittest]({% post_url /python/2015-07-21-python-pytest-with-unittest %})

---

Contents

1. [Hook specification and validation](#hook-specification-and-validation)

1. [Initialization, command line and configuration hooks](#initialization-command-line-and-configuration-hooks)

1. [Generic “runtest” hooks](#generic-runtest-hooks)

---

## Hook specification and validation

pytest는 초기화, 동작, 테스트 실행과 reporting을 hooking하기 위해서 hook 함수를 호출한다. pytest는 각각의 hook 함수는 그 hook specification에 따라서 유효성 검사를 하는 plugin을 불러온다.
각각의 hook 함수 이름과 함수의 매개변수 이름은 hook의 specification에 맞쳐주어야 한다. 하지만 hook 함수는 spec에 비해서 더 적게 매개변수를 갖고 있어도 일반적으로 상관없다. 만약 매개변수 이름이나 hook 함수의 이름을 잘못 입력한 경우 에러가 발생할 것이다.

밑에 있는 함수들의 테스트를 위해서 간략한 테스트 코드를 작성하였다.

*test_example.py*
{% highlight python linenos %}

import pytest

@pytest.mark.tryfirst
def test_example():

  assert 0

{% endhighlight %}


## Initialization, command line and configuration hooks

<!--
*pytest_load_initial_conftests*(args, early_config, parser)

implements the loading of initial conftest files ahead of command line option parsing.

---
-->

**pytest_cmdline_preparse(config, args)** [*deprecated*]

opetion들이 파싱되기 전에 변경할 수 있다.

각 매개변수가 어떤 값을 보여주는지 확인해보기 위해서 print함수를 이용해서 출력해보았다.

*conftest.py*
{% highlight python linenos %}

def pytest_cmdline_preparse(config, args):
  print("cmdline preparse")

  print(config)
  print(args)

{% endhighlight %}

이 코드를 conftest.py에 추가하고 testing을 시작하면, 

    $ py.test -s
    cmdline preparse
    <_pytest.config.Config object at 0x10fa66790>
    ['-s']
    ========================================= test session starts =========================================
    platform darwin -- Python 2.7.6 -- py-1.4.30 -- pytest-2.7.2
    rootdir: /Users/Luavis/Projects/pytest-examples, inifile:
    collected 1 items

    test_example.py F

    ============================================== FAILURES ===============================================
    ____________________________________________ test_example _____________________________________________

        @pytest.mark.tryfirst
        def test_example():

    >     assert 0
    E     assert 0

    test_example.py:7: AssertionError
    ====================================== 1 failed in 0.01 seconds =======================================

결과를 얻을 수 있다. -s라는 option을 붙혀서 *py.test*를 실행했을때, args에는 -s가 list형식으로 들어가 있는것을 볼 수 있다.

---
<!--
*pytest_cmdline_parse*(pluginmanager, args)

return initialized config object, parsing the specified args.

---

*pytest_namespace*()

return dict of name->object to be made globally available in the pytest namespace. This hook is called before command line options are parsed.

---
-->
**pytest_addoption(parser)**

ini 파일이나 argument로 등록되는 설정들을 새롭게 등록할 수 있다.
*이 함수는 플러그 인에서 구현되어 있어야하며, 테스트가 시작될 때 오직 한 번만 실행된다.*

*Parameters*

- parser – 커맨드 라인 형식의 설정을 추가하고 싶다면, *parser.addoption(...)*를 호출하여 설정들을 추가할 수 있다. 만약 ini파일 형식의 설정을 추가하고 싶다면, *parser.addini(...)*를 호출하면 가능하다.

> Note
>
> 옵션들은 나중에 config 객체를 통하여 접근할 수 있다.
>
> *config.getoption(name)* 커맨드 라인으로 부터 받은 설정 값을 받을때
> 
> *config.getini(name)* ini file로 부터 받은 설정 값을 받을때
> 
> config 객체는 많은 pytest 내부 객체에 *.config*를 이용하여 접근할 수 있고, *pytestconfig*라는 fixture를 이용하여 접근할 수 있다. pytest module를 이용하여 *pytest.config*를 이용하여 접근할 수 있지만 *deprecated*된 기능이다.

---

**pytest_cmdline_main(config)**

main 커맨드 라인 동작이 실행될때 호출된다. 기본적인 구현은 configure hooks과 runtest_mainloop을 호출한다.

위의 *pytest_addoption*과 합친 예제를 보자면:

{% highlight python linenos %}

def pytest_addoption(parser):
  parser.addoption("--cmdopt", action="store", default="type1",
        help="my option: type1 or type2")

def pytest_cmdline_main(config):
  print(config.getoption("--cmdopt"))

{% endhighlight %}

add option hook을 이용하여 커맨드라인 형식의 옵션 --cmdopt를 추가하였고, 이를 기본값으로 실행되었을때 cmdline_main에서는 config에서 확인 할 수 있어야 한다.

    $ py.test
    type1
    ========================================= test session starts =========================================
    platform darwin -- Python 2.7.6 -- py-1.4.30 -- pytest-2.7.2
    rootdir: /Users/Luavis/Projects/pytest-examples, inifile:
    collected 1 items

    test_example.py F

    ============================================== FAILURES ===============================================
    ____________________________________________ test_example _____________________________________________

        @pytest.mark.tryfirst
        def test_example():
    >     assert 0
    E     assert 0

    test_example.py:7: AssertionError
    ====================================== 1 failed in 0.01 seconds =======================================



---

**pytest_configure(config)**

커맨드 라인 형식의 옵션이 모두 파싱되었고, 모든 플러그인과 initaial conftest가 호출된 뒤에 호출된다.

---

**pytest_unconfigure(config)**

테스트가 종료되기 전에 호출된다.

---

## Generic “runtest” hooks

모든 runtest들은 *pytest.Item* 객체를 받을 수 있는 훅으로 연관되어 있다.

**pytest_runtest_protocol(item, nextitem)**

runtest의  setup, test의 호출, teardown을 예외처리, hook의 report 호출까지 포함하여 모두 *item*으로 받을 수 있다.

*Parameters*

- item – runtest 가 현재 실행되고 있는 test item
- nextitem – 다음에 실행될 것이라고 계획되어 있는 test item(마지막인 경우에는 None이다). 이 매개변수는 pytest_runtest_teardown()로 부터 온다.
<!-- the scheduled-to-be-next test item (or None if this is the end my friend). This argument is passed on to pytest_runtest_teardown().-->

*Return* [boolean]

만약 True를 반환하면 그 후의 hook이 동작하지 않는다. 

---

**pytest_runtest_setup(item)**

*pytest_runtest_call(item)*가 호출되기 전에 호출된다.

---

**pytest_runtest_call(item)**

test item이 실행될때 호출된다.

---

**pytest_runtest_teardown(item, nextitem)**

*pytest_runtest_call* 호출된 뒤에 호출된다.

*Parameters*

- nextitem – 다음에 실행될 것이라고 계획되어 있는 test item(마지막인 경우에는 None이다).

위의 모든 hook 함수들을 테스트 해보기 위하여, testcase code와 conftest.py를 수정했다.

*test_example.py*
{% highlight python linenos %}

import pytest

def test_example():
  pass

def test_example2():
  pass
  
{% endhighlight %}


*conftest.py*
{% highlight python linenos %}

def pytest_runtest_protocol(item, nextitem):
  print("protocol")
  print(item)
  print(nextitem)

def pytest_runtest_setup(item):
  print("setup")
  print(item)

def pytest_runtest_call(item):
  print("call")
  print(item)

def pytest_runtest_teardown(item, nextitem):
  print("teardown")
  print(item)
  print(nextitem)
  
{% endhighlight %}

teardown에서 발생하는 로그를 capturing되지 않도록 하기 위해서 -s(--capture=no) option을 주어 실행해보면,

    $ py.test -s
    ========================================= test session starts =========================================
    platform darwin -- Python 2.7.6 -- py-1.4.30 -- pytest-2.7.2
    rootdir: /Users/Luavis/Projects/pytest-examples, inifile:
    collected 2 items
    protocol
    <Function 'test_example'>
    <Function 'test_example2'>

    test_example.py setup
    <Function 'test_example'>
    call
    <Function 'test_example'>
    .teardown
    <Function 'test_example'>
    <Function 'test_example2'>
    protocol
    <Function 'test_example2'>
    None
    setup
    <Function 'test_example2'>
    call
    <Function 'test_example2'>
    .teardown
    <Function 'test_example2'>
    None


    ====================================== 2 passed in 0.01 seconds =======================================

*test_example*이 실행되고 후 *test_example2*가 실행될 것이다 그리고 protocol에서 이번 *item*인 *test_example*과 다음 실행될 *test_example2*가 *nextitem*인 것을 확인할 수 있다. 그리고 그 다음 protocol에서는 *item*이 *test_example2*이고 그 다음 실행될 run test는 없음으로 *nextitem*은 None으로 설정된것을 볼 수 있다.

----

**pytest_runtest_makereport(item, call)**

*item*은 *pytest.Item*의 instance이고, *call*은 *_pytest.runner.CallInfo*의 instance이다. 그리고 return 값은 *_pytest.runner.TestReport*의 instance여야 한다.

동작 방식을 보고자 아까 수정했던 코드에 조금 수정을 더하여 보았다.

*conftest.py*
{% highlight python linenos %}

# ...

def pytest_runtest_teardown(item, nextitem):
  return "tear down test"
  
def pytest_runtest_makereport(item, call):

  print("item")
  print(item)

  print("call")
  print(call)
  
{% endhighlight %}

*test_example.py*
{% highlight python linenos %}

import pytest

def test_example():
  pass

def test_example2():
  pass
  
{% endhighlight %}

그리고 *test_example.py*에서 *test_example2*를 지웠다. 그 결과를 출력해보면:

    $ py.test
    ========================================= test session starts =========================================
    platform darwin -- Python 2.7.6 -- py-1.4.30 -- pytest-2.7.2
    rootdir: /Users/Luavis/Projects/pytest-examples, inifile:
    collected 1 items

    test_example.py item
    <Function 'test_example'>
    call
    <CallInfo when='setup' result: []>
    item
    <Function 'test_example'>
    call
    <CallInfo when='call' result: []>
    .item
    <Function 'test_example'>
    call
    <CallInfo when='teardown' result: ['tear down test']>


    ====================================== 1 passed in 0.01 seconds =======================================


이런 결과화면을 얻을 수 있다. teardown이 위에서 hook function에  return 값으로 처리된 값이 report쪽에서 result로 접근하여 볼 수 있다.

<!--
---

## Collection hooks

pytest calls the following hooks for collecting files and directories:

*pytest_ignore_collect*(path, config)
return True to prevent considering this path for collection. This hook is consulted for all files and directories prior to calling more specific hooks.

---

*pytest_collect_directory*(path, parent)
called before traversing a directory for collection files.

---

*pytest_collect_file*(path, parent)
return collection Node or None for the given path. Any new node needs to have the specified parent as a parent.

For influencing the collection of objects in Python modules you can use the following hook:

---

*pytest_pycollect_makeitem*(collector, name, obj)
return custom item/collector for a python object in a module, or None.

---

*pytest_generate_tests*(metafunc)[source]
generate (multiple) parametrized calls to a test function.

After collection is complete, you can modify the order of items, delete or otherwise amend the test items:

pytest_collection_modifyitems(session, config, items)[source]
called after collection has been performed, may filter or re-order the items in-place.

---

## Reporting hooks

Session related reporting hooks:

*pytest_collectstart*(collector)
collector starts collecting.

---

*pytest_itemcollected*(item)
we just collected a test item.

---

*pytest_collectreport*(report)
collector finished collecting.

---

*pytest_deselected*(items)
called for test items deselected by keyword.

---

And here is the central hook for reporting about test execution:

*pytest_runtest_logreport*(report)
process a test setup/call/teardown report relating to the respective phase of executing a test.

---

## Debugging/Interaction hooks

There are few hooks which can be used for special reporting or interaction with exceptions:

*pytest_internalerror*(excrepr, excinfo)
called for internal errors.

---

*pytest_keyboard_interrupt*(excinfo)
called for keyboard interrupt.

---

*pytest_exception_interact*(node, call, report)
(experimental, new in 2.4) called when an exception was raised which can potentially be interactively handled.

This hook is only called if an exception was raised that is not an internal exception like “skip.Exception”.

---

## Declaring new hooks

Plugins and conftest.py files may declare new hooks that can then be implemented by other plugins in order to alter behaviour or interact with the new plugin:

*pytest_addhooks*(pluginmanager)
called at plugin load time to allow adding new hooks via a call to pluginmanager.registerhooks(module).

Hooks are usually declared as do-nothing functions that contain only documentation describing when the hook will be called and what return values are expected.

For an example, see newhooks.py from xdist: pytest distributed testing plugin.

---

## Using hooks from 3rd party plugins

Using new hooks from plugins as explained above might be a little tricky because the standard Hook specification and validation mechanism: if you depend on a plugin that is not installed, validation will fail and the error message will not make much sense to your users.

One approach is to defer the hook implementation to a new plugin instead of declaring the hook functions directly in your plugin module, for example:

*myplugin.py*
{% highlight python linenos %}
class DeferPlugin(object):
    """Simple plugin to defer pytest-xdist hook functions."""

    def pytest_testnodedown(self, node, error):
        """standard xdist hook function.
        """

def pytest_configure(config):
    if config.pluginmanager.hasplugin('xdist'):
        config.pluginmanager.register(DeferPlugin())
{% endhighlight %}

This has the added benefit of allowing you to conditionally install hooks depending on which plugins are installed.


## hookwrapper: executing around other hooks

New in version 2.7: (experimental)

pytest plugins can implement hook wrappers which which wrap the execution of other hook implementations. A hook wrapper is a generator function which yields exactly once. When pytest invokes hooks it first executes hook wrappers and passes the same arguments as to the regular hooks.

At the yield point of the hook wrapper pytest will execute the next hook implementations and return their result to the yield point in the form of a CallOutcome instance which encapsulates a result or exception info. The yield point itself will thus typically not raise exceptions (unless there are bugs).

Here is an example definition of a hook wrapper:

{% highlight python linenos %}
import pytest

@pytest.mark.hookwrapper
def pytest_pyfunc_call(pyfuncitem):
    # do whatever you want before the next hook executes
    outcome = yield
    # outcome.excinfo may be None or a (cls, val, tb) tuple
    res = outcome.get_result()  # will raise if outcome was exception
    # postprocess result
{% endhighlight %}

Note that hook wrappers don’t return results themselves, they merely perform tracing or other side effects around the actual hook implementations. If the result of the underlying hook is a mutable object, they may modify that result, however.

## Reference of objects involved in hooks

class Config[source]
access to configuration values, pluginmanager and plugin hooks.

option = None
access to command line option as attributes. (deprecated), use getoption() instead

pluginmanager = None
a pluginmanager instance

warn(code, message)[source]
generate a warning for this test session.

classmethod fromdictargs(option_dict, args)[source]
constructor useable for subprocesses.

addinivalue_line(name, line)[source]
add a line to an ini-file option. The option must have been declared but might not yet be set in which case the line becomes the the first line in its value.

getini(name)[source]
return configuration value from an ini file. If the specified name hasn’t been registered through a prior parser.addini call (usually from a plugin), a ValueError is raised.

getoption(name, default=<NOTSET>, skip=False)[source]
return command line option value.

Parameters:	
name – name of the option. You may also specify the literal --OPT option instead of the “dest” option name.
default – default value if no option of that name exists.
skip – if True raise pytest.skip if option does not exists or has a None value.
getvalue(name, path=None)[source]
(deprecated, use getoption())

getvalueorskip(name, path=None)[source]
(deprecated, use getoption(skip=True))

class Parser[source]
Parser for command line arguments and ini-file values.

getgroup(name, description='', after=None)[source]
get (or create) a named option Group.

Name:	name of the option group.
Description:	long description for –help output.
After:	name of other group, used for ordering –help output.
The returned group object has an addoption method with the same signature as parser.addoption but will be shown in the respective group in the output of pytest. --help.

addoption(*opts, **attrs)[source]
register a command line option.

Opts:	option names, can be short or long options.
Attrs:	same attributes which the add_option() function of the argparse library accepts.
After command line parsing options are available on the pytest config object via config.option.NAME where NAME is usually set by passing a dest attribute, for example addoption("--long", dest="NAME", ...).

addini(name, help, type=None, default=None)[source]
register an ini-file option.

Name:	name of the ini-variable
Type:	type of the variable, can be pathlist, args or linelist.
Default:	default value if no ini-file option exists but is queried.
The value of ini-variables can be retrieved via a call to config.getini(name).

class Node[source]
base class for Collector and Item the test collection tree. Collector subclasses have children, Items are terminal nodes.

name = None
a unique name within the scope of the parent node

parent = None
the parent collector node.

config = None
the pytest config object

session = None
the session this node is part of

fspath = None
filesystem path where this node was collected from (can be None)

keywords = None
keywords/markers collected from all scopes

extra_keyword_matches = None
allow adding of extra keywords to use for matching

ihook
fspath sensitive hook proxy used to call pytest hooks

warn(code, message)[source]
generate a warning with the given code and message for this item.

nodeid
a ::-separated string denoting its collection tree address.

listchain()[source]
return list of all parent collectors up to self, starting from root of collection tree.

add_marker(marker)[source]
dynamically add a marker object to the node.

marker can be a string or pytest.mark.* instance.

get_marker(name)[source]
get a marker object from this node or None if the node doesn’t have a marker with that name.

listextrakeywords()[source]
Return a set of all extra keywords in self and any parents.

addfinalizer(fin)[source]
register a function to be called when this node is finalized.

This method can only be called when this node is active in a setup chain, for example during self.setup().

getparent(cls)[source]
get the next parent node (including ourself) which is an instance of the given class

class Collector[source]
Bases: _pytest.main.Node

Collector instances create children through collect() and thus iteratively build a tree.

exception CollectError[source]
Bases: Exception

an error during collection, contains a custom message.

Collector.collect()[source]
returns a list of children (items and collectors) for this collection node.

Collector.repr_failure(excinfo)[source]
represent a collection failure.

class Item[source]
Bases: _pytest.main.Node

a basic test invocation item. Note that for a single function there might be multiple test invocation items.

class Module[source]
Bases: _pytest.main.File, _pytest.python.PyCollector

Collector for test classes and functions.

class Class[source]
Bases: _pytest.python.PyCollector

Collector for test methods.

class Function[source]
Bases: _pytest.python.FunctionMixin, _pytest.main.Item, _pytest.python.FuncargnamesCompatAttr

a Function Item is responsible for setting up and executing a Python test function.

function
underlying python ‘function’ object

runtest()[source]
execute the underlying test function.

class CallInfo[source]
Result/Exception info a function invocation.

when = None
context of invocation: one of “setup”, “call”, “teardown”, “memocollect”

excinfo = None
None or ExceptionInfo object.

class TestReport[source]
Basic test report object (also used for setup and teardown calls if they fail).

nodeid = None
normalized collection node id

location = None
a (filesystempath, lineno, domaininfo) tuple indicating the actual location of a test item - it might be different from the collected one e.g. if a method is inherited from a different module.

keywords = None
a name -> value dictionary containing all keywords and markers associated with a test invocation.

outcome = None
test outcome, always one of “passed”, “failed”, “skipped”.

longrepr = None
None or a failure representation.

when = None
one of ‘setup’, ‘call’, ‘teardown’ to indicate runtest phase.

sections = None
list of (secname, data) extra information which needs to marshallable

duration = None
time it took to run just the test

class CallOutcome[source]
Outcome of a function call, either an exception or a proper result. Calling the get_result method will return the result or reraise the exception raised when the function was called.

-->