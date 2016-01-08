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
    
Creates a noradf module in a Noradf Application with prompting

    noradf module
    
Creates a noradf module in a Noradf Application

    noradf module mymodule
    
Creates a noradf module in a Noradf Application with prompting

    noradf module-dev

Create a noradf module for development

    noradf module-dev mymodule
    
Install a npm package in a developing module

    noradf module-dev -n npmModule
    
Install a bower package in a developing module

    noradf module-dev -b bowerModule