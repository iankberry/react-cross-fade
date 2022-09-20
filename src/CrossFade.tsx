import styled from "@emotion/styled";
import clsx from "clsx";
import * as React from "react";
import { useRef } from "react";
import { Freeze } from "react-freeze";
import { usePrevious } from "./usePrevious";

type Props = {
    contentKey: string
    onTransition?: (from: HTMLElement, to: HTMLElement) => void
    timeout?: number
    children: React.ReactNode
}

type AnimationState = {
    fromNode: React.ReactNode | null
    swapped: boolean
    animating: boolean
}

export const CrossFade = ({ contentKey, onTransition, timeout = 400, children }: Props) => {
    // keep references to container elements
    const firstNode = useRef<HTMLElement|null>(null);
    const secondNode = useRef<HTMLElement|null>(null);

    // tracks the current state of the fade animation
    const animationState = useRef<AnimationState>({ fromNode: null, swapped: false, animating: false })

    // retain a reference to the previous content to perform the fade animation
    const previousChildren = usePrevious<React.ReactNode>(children);
    // detect when the content (page) changes
    const previousContentKey = usePrevious<string>(contentKey);

    // when contentKey changes, trigger the cross-fade animation
    if (contentKey !== previousContentKey && previousContentKey !== undefined) {
        animationState.current = {
            fromNode: previousChildren,
            swapped: !animationState.current.swapped,
            animating: true, // track whether animation is in progress so both components can be unfrozen
        }

        // run onTransition after the next render
        setTimeout(() => {
            if (onTransition && firstNode.current && secondNode.current) {
                onTransition(animationState.current.swapped ? secondNode.current : firstNode.current, animationState.current.swapped ? firstNode.current : secondNode.current);
            }
        }, 0);

        // assume animation ends after the timeout
        setTimeout(() => {
            animationState.current.animating = false;
        }, timeout);
    }

    const { swapped, fromNode, animating } = animationState.current;

    return (
        <CrossFadeContainer timeout={timeout} className="cross-fade-container">
            <div className={clsx({ from: !swapped, to: swapped })} ref={node => firstNode.current = node}>
                <Freeze freeze={!swapped && !animating}>
                    {swapped ? children : fromNode}
                </Freeze>
            </div>
            <div className={clsx({ from: swapped, to: !swapped })} ref={node => secondNode.current = node}>
                <Freeze freeze={swapped && !animating}>
                    {swapped ? fromNode : children}
                </Freeze>
            </div>
        </CrossFadeContainer>
    )
}

const CrossFadeContainer = styled('div')<{ timeout: number }>`
    display: grid;
    height: 100%;
    // constrain grid items to container
    grid-template-rows: 100%;
    grid-template-columns: 100%;
    // make sure the different compositing is limited to this element
    isolation: isolate;

    & > * {
        // layer the elements on top of each other
        grid-area: 1 / 1;
        // fade animation
        transition: opacity ${props => props.timeout}ms ease-in-out;
    }

    .from {
        opacity: 0;
        // keep old behind current content
        z-index: -1;
    }
    .to {
        opacity: 1;
    }
`;