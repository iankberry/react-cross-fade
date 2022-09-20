# react-cross-fade

> Cross-fade between React component states

This component provides a true cross-fade transition between two React component states.

There are plenty of animation libraries out there that can perform a "fade" transition between two React components. However, from what I've found, these libraries tend to only fade new content in rather than seamlessly fading between two states. To accomplish a true cross-fade, you need to have both component states rendered at the same time, which can be a pain to manage.

## Features

 - ✅ Works with any React node, making it suitable for both whole page navigation or just a bit of text
 - ✅ Transition state is managed using a simple `contentKey` prop
 - ✅ Uses the `react-freeze` library to suspend rendering from any invisible components used to perform the transition. This is useful especially for components with large subtrees such as navigation.
 - ✅ Transition callback includes underlying DOM elements to allow for more advanced transitions.

## Installation

> This component requires React 17 or higher due to usage of Suspense

```sh
npm install --save react-cross-fade
```

## Using the demo

1. Checkout this repository

2. Run the below command to start the server on port 8080.

```sh
npm run demo
```

## Docs

### Props

| Prop | Type                                      | Default | Definition                                                                 |
| --- |-------------------------------------------| --- |----------------------------------------------------------------------------|
| contentKey | `string`                                  | REQUIRED | A string that triggers the cross-fade transition when it changes           |
 | onTransition | `(from: HTMLElement, to: HTMLElement) => void` | None | Called when the transition begins with the source and destination elements |
 | timeout | `number`                                  | 400 | How long to perform the transition for (in milliseconds)                   |
 | children | `React.ReactNode` | REQUIRED | The React node that will transition when `contentKey` changes.             |
### Detailed props

#### contentKey `string`
This prop controls the cross-fade transition. When it changes, the content of the previous render will cross-fade to the content of the current render. A transition will **never** occur if this value does not change. If you're using this for navigation, you might put some sort of page id here.

#### onTransition `function`
This callback function is emitted when a transition is about to occur. It is provided both the "from" and "to" underlying DOM elements as parameters. This can be used for instance to trigger additional transitions during the cross-fade. The example below shows how you might animate a variable height header between two transition states.

```jsx
const App = () => {
    const currentNavId = 'home';
    const headerHeight = 100; // this would change per page to animate

    return (
        <CrossFade
            contentKey={currentNavId}
            onTransition={(from, to) => {
                const fromHeader = from.querySelector<HTMLElement>('.header');
                const toHeader = to.querySelector<HTMLElement>('.header');

                // update header height on fade transition to begin 'slide' animation
                if (fromHeader) {
                    fromHeader.style.minHeight = headerHeight.toString() + 'px';
                    fromHeader.style.height = headerHeight.toString() + 'px';
                }
                if (toHeader) {
                    toHeader.style.minHeight = headerHeight.toString() + 'px';
                    toHeader.style.height = headerHeight.toString() + 'px';
                }
            }}
        >
            <div 
                className="header" 
                style={{
                    minHeight: headerHeight + 'px',
                    height: headerHeight + 'px',
                    transition: 'height .4s, min-height .4s',
                    backgroundColor: 'navy',
                }}
            >
                Header content here
            </div>
        </CrossFade>
    );
}
```

#### timeout `number`

The number of milliseconds to perform the transition for. Defaults to 400 milliseconds.

#### children `React.ReactNode`

The content to render. You can put any React node here though I would recommend keeping the height/width of the content consistent. See below under _Known issues_ for more information.

## Example

The following example cross-fades between two emojis every 3 seconds.

```jsx 
import React from 'react';
import { CrossFade } from "react-cross-fade";

const App = () => {
    const [swapped, setSwapped] = React.useState(false);

    React.useEffect(() => {
        const intervalId = setInterval(() =>
                setSwapped(swapped => !swapped),
            3000 // every 3 seconds
        );
        return () => clearTimeout(intervalId);
    }, []);

    return (
        <CrossFade contentKey={swapped.toString()} timeout={2000}>
            <p style={{ fontSize: '64px' }}>{swapped ? '😭' : '😀'}</p>
        </CrossFade>
    );
}
```

The result looks like the following:

![cross-fade-example](https://raw.githubusercontent.com/iankberry/react-cross-fade/master/example-gifs/emojis.gif)

[![Edit react-cross-fade example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-cross-fade-example-kcitpl?fontsize=14&hidenavigation=1&theme=dark)

## Known issues 😭

- Because the transition requires two component states to be visible at once, it is generally best if all children conform to the same height/width. Otherwise, the parent container will expand to fit the larger of the two component states, possibly leaving unnecessary space.

- Since opacity is used to perform the transition, you might notice a "fade out" effect when transitioning content with a higher contrast background. The example below has a white background behind the gray header which bleeds through during the transition. I'd recommend setting the background color of the parent container to minimize contrast with the transitioning content.

![cross-fade-example](https://raw.githubusercontent.com/iankberry/react-cross-fade/master/example-gifs/background.gif)

## Note

Feel free to submit issues/PR's and I will do my best to respond. I'm sure there are plenty of improvements that can be made :-)

## License

This project is licensed under the terms of the [MIT license](https://github.com/iankberry/react-cross-fade/blob/master/LICENSE).