function fakeShell() {
    const shell = {
        onExit: () => {},
        exit: false,
        keyPressed: () => {},
        keyReleased: () => {},
        mouseClicked: () => {},
        mouseDragged: () => {},
        mousePressed: () => {},
        mouseReleased: () => {},
        mouseMoved: () => {},
        windowResized: () => {},
        ...Shell,
    };

    return shell;
}

return { fakeShell };
