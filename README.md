
# after-effects-ad-astra
This is a collection of utility methods for working with after effects extendscript. It has been developed since 2012 by Martin Bollerup, Johan Bichel Lindegaard and Jonas Jongejan while working for the Danish Broadcast Corporation where we use it for the automated rendering of all internal promotion, trailers, presentations and such on flow TV. We have had a lot of headaches over the years working with extendscript and problems finding reliable documentation. The solutions to some of the problems we have faced are in this library and I hope they may be of use to other people.

The intention is to clean it up and make it into a more general purpose utility library for after effects extendscript. Suggestions and contributions are welcome!

## Getting started 

Include the library in the beginning of your script:
    $.evalFile("adastra.jsx");


## Tips and tricks when developing
Avoid using the ExtendScript Toolkit editor for writing code. It seems very buggy and may cache earlier versions of code so what is executed is not what you see, in my workflow I use another editor and only open the entry point file for execution in ExtendScript Toolkit, I make sure this is a file I am not making changes in, whenever I do make changes in it I restart ExtendScript Toolkit.

Usefull documentation for extendscript here: http://docs.aenhancers.com/

## TODO
- Encapsulate classes better
- Improve namespacing and structure
- Remove try catch sections that are potentially problematic
- Rethink mainComp and stage references
- Implement new logger class
- look at https://github.com/cobhimself/Before-Effects

