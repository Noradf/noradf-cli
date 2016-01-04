# Norad Framework Command Line

norad-cli is part of the [Norad Framework](https://github.com/Noradf)

## Basic Usage

Create a noradf project

    noradf init
    
Install a noradf module from https://github.com/Noradf repository

    noradf install mymodule
    
Install a noradf module from a git repository

    noradf install mymodule --git https://github.com/user/mymodule
    
Install a noradf module from path
    
    noradf install mymodule --path ~/my/module/path
    
Install all the modules in modules property from noradf.json file

    noradf install
    
Install a module and overwrite the existing one

    noradf install mymodule --force
    
Creates a noradf module with prompting

    noradf module
    
Creates a noradf module

    noradf module mymodule