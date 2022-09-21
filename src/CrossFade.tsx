import { css } from "@emotion/css";
import clsx from "clsx";
import * as React from "react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Freeze } from "react-freeze";

type Props = {
    contentKey: string
    onTransition?: (from: HTMLElement, to: HTMLElement) => void
    timeout?: number
    style?: CSSProperties
    children: React.ReactNode
}

type AnimationState = {
    fromNode: React.ReactNode | null
    toNode: React.ReactNode | null
    swapped: boolean
    animating: boolean
}

export const CrossFade = ({ contentKey, onTransition, timeout = 400, style, children }: Props) => {
    // keep references to container elements
    const firstNode = useRef<HTMLElement|null>(null);
    const secondNode = useRef<HTMLElement|null>(null);

    // tracks the current state of the fade animation
    const animationState = useRef<AnimationState>({ fromNode: null, toNode: children, swapped: false, animating: false });

    // use to track previous state when contentKey changes
    const [previousContentKey, setPreviousContentKey] = useState(contentKey);
    const [previousChildren, setPreviousChildren] = useState(children);

    useEffect(() => {
        let animationTimer: ReturnType<typeof setTimeout>;

        if (contentKey !== previousContentKey) {
            animationState.current = {
                fromNode: previousChildren,
                toNode: children,
                swapped: !animationState.current.swapped,
                animating: true, // track whether animation is in progress so both components can be unfrozen
            }

            // run onTransition after the next render
            requestAnimationFrame(() => {
                if (onTransition && firstNode.current && secondNode.current) {
                    console.log('onTransition')
                    onTransition(animationState.current.swapped ? secondNode.current : firstNode.current, animationState.current.swapped ? firstNode.current : secondNode.current);
                }
            });

            // assume animation ends after the timeout
            animationTimer = setTimeout(() => {
                animationState.current.animating = false;
            }, timeout);
        }

        return () => {
            if (animationTimer) {
                clearTimeout(animationTimer);
            }
        }
    }, [contentKey, previousContentKey, children, previousChildren, onTransition, timeout]);

    useEffect(() => {
        setPreviousChildren(children);
    }, [children]);

    useEffect(() => {
        setPreviousContentKey(contentKey);
    }, [contentKey]);

    const { swapped, fromNode, toNode, animating } = animationState.current;

    return (
        <div className={clsx('cross-fade-container', styles.root)} style={style}>
            <div className={clsx(styles.transition(timeout), styles[swapped ? 'to' : 'from'])} ref={node => firstNode.current = node}>
                <Freeze freeze={!swapped && !animating}>
                    {swapped ? toNode : fromNode}
                </Freeze>
            </div>
            <div className={clsx(styles.transition(timeout), styles[swapped ? 'from' : 'to'])} ref={node => secondNode.current = node}>
                <Freeze freeze={swapped && !animating}>
                    {swapped ? fromNode : toNode}
                </Freeze>
            </div>
        </div>
    )
}

const styles = {
    root: css`
        display: grid;
        height: 100%;
        // constrain grid items to container
        grid-template-rows: 100%;
        grid-template-columns: 100%;
        // make sure the different compositing is limited to this element
        isolation: isolate;
    `,
    transition: (timeout: number) => css`
        // layer the elements on top of each other
        grid-area: 1 / 1;
        // fade animation
        transition: opacity ${timeout}ms ease-in-out;
    `,
    from: css`
        opacity: 0;
        // keep old behind current content
        z-index: -1;
    `,
    to: css`
        opacity: 1;
    `,
}