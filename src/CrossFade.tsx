import { css } from "@emotion/css";
import clsx from "clsx";
import * as React from "react";
import { CSSProperties, useEffect, useRef, useState } from "react";

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
}

export const CrossFade = ({ contentKey, onTransition, timeout = 400, style, children }: Props) => {
    // keep references to container elements
    const firstNode = useRef<HTMLElement|null>(null);
    const secondNode = useRef<HTMLElement|null>(null);

    // used to track when a transition is in progress
    const animationTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

    // tracks the current state of the crossfade animation
    const animationState = useRef<AnimationState>({ fromNode: null, toNode: children, swapped: false });

    // use to track previous state to know when to begin the transition
    const [previousContentKey, setPreviousContentKey] = useState(contentKey);
    const [previousChildren, setPreviousChildren] = useState(children);
    // track state so previous children can be removed from the DOM tree after transition completes
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (contentKey !== previousContentKey) {
            animationState.current = {
                fromNode: previousChildren,
                toNode: children,
                swapped: !animationState.current.swapped,
            }

            // run onTransition after the next render
            requestAnimationFrame(() => {
                if (onTransition && firstNode.current && secondNode.current) {
                    onTransition(animationState.current.swapped ? secondNode.current : firstNode.current, animationState.current.swapped ? firstNode.current : secondNode.current);
                }
            });

            // track that a transition is in progress
            setAnimating(true);

            // clear any currently active timers
            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
                animationTimer.current = null;
            }

            // clear state after the timeout so the previous child node can be removed
            animationTimer.current = setTimeout(() => {
                setAnimating(false);
            }, timeout);
        }
    }, [contentKey, previousContentKey, children, previousChildren, onTransition, timeout]);

    // clear any pending timers on unmount
    useEffect(() => () => {
        if (animationTimer.current) {
            clearTimeout(animationTimer.current);
            animationTimer.current = null;
        }
    }, []);

    useEffect(() => {
        setPreviousChildren(children);
    }, [children]);

    useEffect(() => {
        setPreviousContentKey(contentKey);
    }, [contentKey]);

    const { swapped, fromNode, toNode } = animationState.current;

    // during transition, render consistent from/to nodes to keep animation smooth
    const isAnimating = animating || contentKey !== previousContentKey;

    return (
        <div className={clsx('cross-fade-container', styles.root)} style={style}>
            <div className={clsx(styles.transition(timeout), styles[swapped ? 'to' : 'from'])} ref={node => firstNode.current = node}>
                {swapped ? (isAnimating ? toNode : children) : (isAnimating ? fromNode : null)}
            </div>
            <div className={clsx(styles.transition(timeout), styles[swapped ? 'from' : 'to'])} ref={node => secondNode.current = node}>
                {swapped ? (isAnimating ? fromNode : null) : (isAnimating ? toNode : children)}
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