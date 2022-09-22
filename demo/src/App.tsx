import * as React from 'react';
import { CrossFade } from "../../src";

export const App = () => {
    const [page, setPage] = React.useState(0);
    const [timeout, setTimeout] = React.useState('2000');

    return (
        <div className="root">
            <div className="container">
                <div className="content">
                    <h1>{content[page].title}</h1>
                    <CrossFade contentKey={page.toString()} timeout={parseInt(timeout)}>
                        <div className="body" style={{ backgroundColor: content[page].background }}>
                            {content[page].body.map((text, index) => (
                                <p key={index}>{text}</p>
                            ))}
                        </div>
                    </CrossFade>
                </div>
            </div>
            <div className="form">
                <button onClick={() => setPage(page => page + 1 >= content.length ? 0 : page + 1)}>
                    Next page
                </button>
                <p>Timeout (ms):</p>
                <input
                    type="text"
                    value={timeout}
                    onChange={event => setTimeout(event.target.value)}
                />
            </div>
        </div>
    );
}

const content = [
    {
        title: 'Page 1 - Introduction',
        body: [
            'Curabitur risus risus, semper at sem nec, luctus viverra nisi. Maecenas semper vehicula lorem sed pharetra. Donec malesuada ante eu interdum maximus',
            'Praesent posuere augue massa, quis luctus elit interdum sed. Proin ultricies eros ligula, vitae porttitor leo ullamcorper eu. Donec pellentesque fermentum mauris. Vivamus eget commodo justo, at viverra arcu',
        ],
        background: '#ff8a65',
    },
    {
        title: 'Page 2 - Morbi in porttitor',
        body: [
            'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
            'Suspendisse venenatis tellus suscipit ipsum dignissim, ac congue ex suscipit. Nam eu dignissim sem, mattis cursus est.',
            'Duis hendrerit turpis nulla, a imperdiet turpis faucibus id',
        ],
        background: '#c5e1a5',
    },
    {
        title: 'Page 3 - Vivamus consectetur',
        body: [
            'Maecenas at rhoncus diam. Curabitur molestie tortor ac massa bibendum, a tempor mauris tristique.',
            'Donec tempor tellus velit, elementum gravida tortor dictum eu.',
            'Nullam blandit ante a orci blandit, ac elementum nunc tempus. Cras pulvinar, nisi a aliquet placerat, magna augue condimentum libero, ac facilisis orci turpis a neque.',
        ],
        background: '#80deea',
    },
];