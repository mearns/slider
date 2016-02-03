# Slider

A simple tool for generating self-contained HTML slide shows from Markdown.

## Authoring a Presentation

A presentation is contained in a single file. The beginning of each slide is denoted
by a sequence of at least three dashes at the start of the line. This is
reffered to as the *slide start line*.

Beneath the _slide start line_ is markdown text defining the content of the
slide.

### Slide parameters

The _slide start line_ can contain optional parameters, following the initial
sequence of dashes, separated from it by whitespace. Individual parameters are
also separated by whitespace.

There are three types of parameters: _layout_ parameters, _class_ parameters,
and _id_ parameters.

A *layout parameter* specifies the name of the template to use to layout the
slide. There will typically only be one of these per slide, but you can
provide additional parameters to specify _fallback_ layouts, in case the
specified layout is not found. In this case, layouts are applied from first to
last (left to right) until one is found. Layout parameters are specified
literally, without any indicator.

A *class parameter* specifies a CSS class to apply to the slide. These
parameters are always prefixed with a '.' character.

An *id parameter* specifies an ID that will be applied to the slide, for
referenceing in hyperlinks. These paramters are always prefixed with a '#'
character.

### Fragments

A slide can be divided into a sequence of fragments, with fragments separated
by a line containing at least three dots at the start of the line. Fragments
are loaded sequentially as you progress through the slide.

### Semantic Elements

Sldier differentiates between _semantic_ elements and _presentation_ elements.
Semantic elements are specified in a YAML format immediately following the
_slide start line_. These elements can be used to specify things like the
slide-title and author, which are made available to the template which renders
the slide.

Markdown (or HTML) elements, including titles, are considered _presentation_
elements, and are not treated in any special way: they are simply rendered as
part of the body of the slide.

## Appearance and Layout

Individual slides can have a layout and any number of styles specified.

A **layout** is the name of a template file which controls how the slide is laid out.
We typically have layouts like "page", "title", "untitled", "blank", "fullpage", etc.

A **style** is a CSS class which will be applied to the slide and controls its visual
appearance (and potentially it's layout, as well). We might have styles like "neat",
"futuristic", "carnival", "professional", "1997", etc.

### Themes and the Resource Search Path

A **theme** is just a directory with layout templates and CSS style sheets. For a cohesive
look, the theme is specified at the top-level and applies to the whole deck.

Any time a resource (such as a layout template or a stylesheet) is needed, we search
at specified locations under each directory in the **resource search path**. By default, the
search path is a directory named ``res`` in the current directory. Anytime you
specify a theme for a deck, files defined in that theme will take precedence over files found elsewhere.

Each type of resource has a specific subdirectory where it is expected to be found. For instance,
witht he default search path of simply `[./res]`, layout templates are searched for in
`./res/templates`, and stylesheets in `./res/style`.

Themes are also searched for under the resource search path, under the `themes` subdirectory.
For instance, if the search path is equal to `[./res, ./other-res]`, and the theme has been specified
as "roswell", then we will look for layout templates in the following locations, in order:
`./res/themes/roswell/templates`, `./other-res/themes/roswell/templates`,
`./res/templates`, `./other-res/templates`.

