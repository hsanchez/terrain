# install > gem install dl-rake-latex
# tutorial for using dl-rake-latex > http://devel.softeng.ox.ac.uk/trac/softeng/wiki/Utilities/RakeLatex
#
# Typical usage:
# generate pdf? then just type on the command prompt: rake pdf
# want to clear the generated files? then just type on the command prompt: rake clean
require 'rake-latex'

Rake.startfile(__FILE__)

# LaTeX document => report.tex with bibliography citations.
latex('report') do
    |task|
    task.references = ['report.bib']
    task.includes = [
        'introduction.tex',
        'relatedwork.tex',
        'system.tex',
        'conclusions.tex',
        'futurework.tex',
        'problemdescription.tex',
        'algorithms.tex',
        'architecture.tex',
        'demo.tex',
        'three.tex'
    ]
end

Rake.endfile
