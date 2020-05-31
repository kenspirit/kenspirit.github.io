title: It's not that easy to configure mnesia dir as I thought
date: 2020-05-31 23:05:16
tags:
  - Elixir
  - Mnesia
categories:
  - Sword
---

## Why Directory is Required

After using「[One Elixir Code for Both Mnesia Master & Child](http://www.thinkingincrowd.me/2020/04/16/One-Elixir-Code-for-Both-Mnesia-Master-Child/)」locally for basic testing, next step is to explore how to easily deploy to remote server.

Regarding the deployment, I am using Ansible + Mix Release, instead of Docker.  The main reason is to use native tools as much as possible within Elixir ecosystem as this is the main approach of learning one language.

Before using Mnesia, configuring one data directory for it is very important.

Theoretically, Mnesia creates one data directory, as format `NODE_NAME@HOST`, automatically in the same level of the program running directory even though you do not provide the parameter for it.  However, this is not one good approach.  Compared to the program or code directory, data directory should be permanent.  Because every time you deploy a new version of the code to the server, it should have a separate directory in order to keep track of the record or even for emergent fallback.  While data directory should be consistent on matter how many version of program code you deployed.


## The Mix Release Way

When we use `mix release.init` to prepare files for release, one file named `vm.args.eex` will be generated.  This file contains the Erlang VM parameter we want to pass.  It will be renamed to `vm.args` during package generation.

But, if we set directory path in `vm.args.eex`, it becomes one compile-time configuration, instead of one run-time parameter.  How can one single release package run using different data directory?  And why would I want to do that?


## Multi-Site High Availability & Blue Green Deployment

Through below steps, no matter using one or multiple machines:  

1. Setup data directory A, point server A to it.  
2. Setup data directory B, point server B to it.  
3. Stop server A, deploy new version A+ and point to data directory A, restarts A+.  
4. Stop server B, deploy new version B+ and point to data directory B, restarts B+.  

we can have at least one running Mnesia and Elixir nodes any time achieving multi-site HA and blue green deployment without stopping the system.

_Note: For a Mnesia cluster, we should not stop all nodes.  If they must be stopped for some reasons, the restart sequence should be the opposive of stopping sequence.  For example, if you stop the nodes in sequence of AB, then the starting sequence should be BA._


## Parameter format in vm.args

According to the tips in `vm.args`, I checked http://erlang.org/doc/man/erl.html, but still have no idea on how mensia directory should be set.  Based on the material I collected and testing done before, there are a couple of ways to set the dir parameter:  

* Through command line parameter: `iex --erl '-mnesia dir "path/to/db"' -S mix`  
* Setup in Elixir `config.exs`: `config :mnesia, dir: 'path/to/db'`  

However, no matter I set `-mnesia dir "path/to/db"` or `-mnesia dir 'path/to/db'` in `vm.args`, it always has below error while run `:mnesia.info` after server starts:  

```
** (exit) {:aborted, {:application_load_error, {:bad_environment_value, 'path/to/db'}}}
```

After some googling, I updated the setting based on one comment in [Stackoverflow](https://stackoverflow.com/questions/23635474/how-to-specify-directory-for-mnesia-in-cowboy-application) and change it to `-mnesia {dir,'path/to/db'}`.  Although no more error, Mnesia was still not picking up the directory I provided.  

Come on, what should be the right format?  


## The Right Way to Debug

Why it does not work?  Incorrect parameter, or anything else?  

Debugging and finding the root cause is one fundamental and important skill as a developer.  Many inexperienced developer feels helpless once nothing can be found in Google or Stackoverflow.  

Actually, the real problem now is: I do not know whether the Erlang VM receives the parameter or not.  

Hence, the approach to dig out the cause should be:  

1. Find out what the system state should be when it's working properly.
2. Based on the normal system state as baseline, we can tell if the parameter is accepted or not.
3. If aligned, non-parameter setup issue; Else, it should be.

With the help of Google, Erlang method `init.get_arguments` can be used to check all command line parameters and system flags.

Below is the output after configuring `-mnesia {dir,'path/to/db'}` in `vm.args`.  Judging from other parameters, such as `boot_var`, it should still be invalid parameter issue although it does not have any error during system startup.

```elixir
iex(mgr@127.0.0.1)2> :init.get_arguments
[
  root: ['path/to/_build/prod/rel/mgr'],
  progname: ['erl'],
  home: ['/Users/kenchen'],
  kernel: ['shell_history', 'enabled'],
  elixir: ['ansi_enabled', 'true'],
  noshell: [],
  mode: ['embedded'],
  setcookie: ['spider'],
  name: ['mgr@127.0.0.1'],
  config: ['path/to/_build/prod/rel/mgr/tmp/mgr-0.0.1-20200531112256-c4fe.runtime'],
  boot: ['path/to/_build/prod/rel/mgr/releases/0.0.1/start'],
  boot_var: ['RELEASE_LIB',
   'path/to/_build/prod/rel/mgr/lib'],
  mnesia: ['{dir,path/to/db}']
]
```

Below is the ouput after starting system with command `iex --erl '-mnesia dir "path/to/db"' -S mix`.  

```elixir
iex(mgr@127.0.0.1)2> :init.get_arguments
[
  root: ['path/to/_build/prod/rel/mgr'],
  progname: ['erl'],
  home: ['/Users/kenchen'],
  kernel: ['shell_history', 'enabled'],
  elixir: ['ansi_enabled', 'true'],
  noshell: [],
  mode: ['embedded'],
  setcookie: ['spider'],
  name: ['mgr@127.0.0.1'],
  config: ['path/to/_build/prod/rel/mgr/tmp/mgr-0.0.1-20200531112256-c4fe.runtime'],
  boot: ['path/to/_build/prod/rel/mgr/releases/0.0.1/start'],
  boot_var: ['RELEASE_LIB',
   'path/to/_build/prod/rel/mgr/lib'],
  mnesia: ['dir', '"path/to/db"']
]
```

We can see that, `'"path/to/db"'` should be the correct format Erlang VM recognizes.  It has both double quote and single quote.  When I changed the parameter to be `-mnesia dir '"path/to/db"'` in file `vm.args`, problem solved.

_Note: I found that the Mnesia official documentation has stated the command to start Mnesia and pass parameter: `erl -mnesia dir '"/tmp/funky"'`.  Although it is not exactly saying what to set in vm.args, it is still a good hint if I read this in advance._


## Ansible

I only solves part of the puzzle after resovling previous issue.  How can I use Ansible to dynamically configure the parameter and add it to `vm.args`?

In the Ansible playbook, I define a task:  

```yaml
- name: update mnesia path in vm.args
  shell: "echo -mnesia dir {{ data_root }} >> {{ release_root }}/vm.args"
  args:
    executable: /bin/bash
```

Because the Mnesia dir parameter requires both double quote and single quote, I was beaten heavily on trying to escape them in late night.

But it does not take me a long time after clearing my mind by breaking down the issue.

1. How to escape single or double quote in shell.  
2. How to escape single or double quote in Yaml.  

It's not difficult to do that in shell：`echo -mnesia dir "'\"/path/to/db\"'" >> ~/test.txt`.

But it's a little bit more complicated in Yaml, especially when you are using double quote scala.

* In double quote scala, it uses `\` to escape double quote, such as `"here's to \"quotes\""`.  

And so the Ansible task should be:  

```
shell: "echo -mnesia dir \"'\\\"{{ data_root }}\\\"'\" >> {{ release_root }}/vm.args"
```

* In single quote scala, it needs to duplicate single quote to escape, such as `'here''s to "quotes"'`.  

And so the Ansible task should be:  

```
shell: 'echo -mnesia dir "''\"{{ data_root }}\"''" >> {{ release_root }}/vm.args'
```

I never thought so much trouble needs to go through in order to set the dir parameter right for Mnesia.  

