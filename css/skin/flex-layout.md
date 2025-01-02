Define custom spacing for flex layout:
```css
.fx-default{--fx:1rem}
```

Use `fr` for root container and add your custom spacing class as well. `fr` resets the spacing variable to level 1.
```html
[ .fx .fr .fx-default
    [
        Heading 1
        [ .fx
            [ 'Content']
            [ 'Content']
            [ 'Content']
        ]
    ]
    [
        Heading 2
        [ .fx
            [ 'Content']
            [ 'Content']
            [ 'Content']
        ]
    ]
]
```
