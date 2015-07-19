---
layout: post
title:  "Python pytest hook"
date:   2015-07-19 18:49:00
categories: python

---

![pytest]({{ site_url }}/assets/pytest.png)

이번 문서에서는 Pytest의 hook 기능에 대해서 알아보고자 Pytest 공식 사이트의 latest 버전의(2.4) [hook reference 페이지](https://pytest.org/latest/plugins.html#pytest-hook-reference)를 번역해 보기로 했다.

*이 외의 pytest 관련 문서*

1. [Python fixture]({% post_url /python/2015-07-19-python-pytest-fixture %})

---

Hook specification and validation
pytest calls hook functions to implement initialization, running, test execution and reporting. When pytest loads a plugin it validates that each hook function conforms to its respective hook specification. Each hook function name and its argument names need to match a hook specification. However, a hook function may accept fewer parameters by simply not specifying them. If you mistype argument names or the hook name itself you get an error showing the available arguments.

Initialization, command line and configuration hooks
pytest_load_initial_conftests(args, early_config, parser)[source]
implements the loading of initial conftest files ahead of command line option parsing.

pytest_cmdline_preparse(config, args)[source]
(deprecated) modify command line arguments before option parsing.

pytest_cmdline_parse(pluginmanager, args)[source]
return initialized config object, parsing the specified args.

pytest_namespace()[source]
return dict of name->object to be made globally available in the pytest namespace. This hook is called before command line options are parsed.

pytest_addoption(parser)[source]
register argparse-style options and ini-style config values.

This function must be implemented in a plugin and is called once at the beginning of a test run.

Parameters:	parser – To add command line options, call parser.addoption(...). To add ini-file values call parser.addini(...).
Options can later be accessed through the config object, respectively:

config.getoption(name) to retrieve the value of a command line option.
config.getini(name) to retrieve a value read from an ini-style file.
The config object is passed around on many internal objects via the .config attribute or can be retrieved as the pytestconfig fixture or accessed via (deprecated) pytest.config.

pytest_cmdline_main(config)[source]
called for performing the main command line action. The default implementation will invoke the configure hooks and runtest_mainloop.

pytest_configure(config)[source]
called after command line options have been parsed and all plugins and initial conftest files been loaded.

pytest_unconfigure(config)[source]
called before test process is exited.

Generic “runtest” hooks
All runtest related hooks receive a pytest.Item object.

pytest_runtest_protocol(item, nextitem)[source]
implements the runtest_setup/call/teardown protocol for the given test item, including capturing exceptions and calling reporting hooks.

Parameters:	
item – test item for which the runtest protocol is performed.
nextitem – the scheduled-to-be-next test item (or None if this is the end my friend). This argument is passed on to pytest_runtest_teardown().
Return boolean:	
True if no further hook implementations should be invoked.
pytest_runtest_setup(item)[source]
called before pytest_runtest_call(item).

pytest_runtest_call(item)[source]
called to execute the test item.

pytest_runtest_teardown(item, nextitem)[source]
called after pytest_runtest_call.

Parameters:	nextitem – the scheduled-to-be-next test item (None if no further test item is scheduled). This argument can be used to perform exact teardowns, i.e. calling just enough finalizers so that nextitem only needs to call setup-functions.
pytest_runtest_makereport(item, call)[source]
return a _pytest.runner.TestReport object for the given pytest.Item and _pytest.runner.CallInfo.

For deeper understanding you may look at the default implementation of these hooks in _pytest.runner and maybe also in _pytest.pdb which interacts with _pytest.capture and its input/output capturing in order to immediately drop into interactive debugging when a test failure occurs.

The _pytest.terminal reported specifically uses the reporting hook to print information about a test run.

Collection hooks
pytest calls the following hooks for collecting files and directories:

pytest_ignore_collect(path, config)[source]
return True to prevent considering this path for collection. This hook is consulted for all files and directories prior to calling more specific hooks.

pytest_collect_directory(path, parent)[source]
called before traversing a directory for collection files.

pytest_collect_file(path, parent)[source]
return collection Node or None for the given path. Any new node needs to have the specified parent as a parent.

For influencing the collection of objects in Python modules you can use the following hook:

pytest_pycollect_makeitem(collector, name, obj)[source]
return custom item/collector for a python object in a module, or None.

pytest_generate_tests(metafunc)[source]
generate (multiple) parametrized calls to a test function.

After collection is complete, you can modify the order of items, delete or otherwise amend the test items:

pytest_collection_modifyitems(session, config, items)[source]
called after collection has been performed, may filter or re-order the items in-place.

Reporting hooks
Session related reporting hooks:

pytest_collectstart(collector)[source]
collector starts collecting.

pytest_itemcollected(item)[source]
we just collected a test item.

pytest_collectreport(report)[source]
collector finished collecting.

pytest_deselected(items)[source]
called for test items deselected by keyword.

And here is the central hook for reporting about test execution:

pytest_runtest_logreport(report)[source]
process a test setup/call/teardown report relating to the respective phase of executing a test.

Debugging/Interaction hooks
There are few hooks which can be used for special reporting or interaction with exceptions:

pytest_internalerror(excrepr, excinfo)[source]
called for internal errors.

pytest_keyboard_interrupt(excinfo)[source]
called for keyboard interrupt.

pytest_exception_interact(node, call, report)[source]
(experimental, new in 2.4) called when an exception was raised which can potentially be interactively handled.

This hook is only called if an exception was raised that is not an internal exception like “skip.Exception”.

Declaring new hooks
Plugins and conftest.py files may declare new hooks that can then be implemented by other plugins in order to alter behaviour or interact with the new plugin:

pytest_addhooks(pluginmanager)[source]
called at plugin load time to allow adding new hooks via a call to pluginmanager.registerhooks(module).

Hooks are usually declared as do-nothing functions that contain only documentation describing when the hook will be called and what return values are expected.

For an example, see newhooks.py from xdist: pytest distributed testing plugin.

Using hooks from 3rd party plugins
Using new hooks from plugins as explained above might be a little tricky because the standard Hook specification and validation mechanism: if you depend on a plugin that is not installed, validation will fail and the error message will not make much sense to your users.

One approach is to defer the hook implementation to a new plugin instead of declaring the hook functions directly in your plugin module, for example:

# contents of myplugin.py

class DeferPlugin(object):
    """Simple plugin to defer pytest-xdist hook functions."""

    def pytest_testnodedown(self, node, error):
        """standard xdist hook function.
        """

def pytest_configure(config):
    if config.pluginmanager.hasplugin('xdist'):
        config.pluginmanager.register(DeferPlugin())
This has the added benefit of allowing you to conditionally install hooks depending on which plugins are installed.

hookwrapper: executing around other hooks
New in version 2.7: (experimental)

pytest plugins can implement hook wrappers which which wrap the execution of other hook implementations. A hook wrapper is a generator function which yields exactly once. When pytest invokes hooks it first executes hook wrappers and passes the same arguments as to the regular hooks.

At the yield point of the hook wrapper pytest will execute the next hook implementations and return their result to the yield point in the form of a CallOutcome instance which encapsulates a result or exception info. The yield point itself will thus typically not raise exceptions (unless there are bugs).

Here is an example definition of a hook wrapper:

import pytest

@pytest.mark.hookwrapper
def pytest_pyfunc_call(pyfuncitem):
    # do whatever you want before the next hook executes
    outcome = yield
    # outcome.excinfo may be None or a (cls, val, tb) tuple
    res = outcome.get_result()  # will raise if outcome was exception
    # postprocess result
Note that hook wrappers don’t return results themselves, they merely perform tracing or other side effects around the actual hook implementations. If the result of the underlying hook is a mutable object, they may modify that result, however.

Reference of objects involved in hooks
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