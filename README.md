# Slider

A simple tool for generating self-contained HTML slide shows from Markdown.

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

