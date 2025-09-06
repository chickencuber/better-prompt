const {fakeShell} = await use("~/fakeShell.exe")
const c = JSON.parse(await FS.getFromPath("/user/better-prompt/conf.json"));
const shell = fakeShell();

function remove_canvas() {
    Shell.gl.ready = false;
    Shell.gl.canvas.remove();
    Shell.gl.canvas = false;
}
const history = (await FS.getFromPath("/user/better-prompt/history")).split("\n").map(v => v.trim()).filter(v => v !== "");

if(Shell.supports_fansi) {
    Shell.terminal.background = c.background || 0;
}
Shell.terminal.clear();
let buf = "";
function renderline(opt) {
    let str = "";
    for(let i of opt) {
        const fg = i.fg || "#ffffff";
        const bg = i.bg || "#000000";
        if(Shell.supports_fansi) {
            str += `\x1bf[${fg.slice(1)}m\x1bb[${bg.slice(1)}m`
        }
        switch(i.type) {
            case "text": {
                str += i.text;
            }
                break;
            case "var": {
                str += Shell.localVars[i.var];
            }
                break;
        }
    } 
    buf += str;
}

renderline(c.startup);
buf += "\n";
renderline(c.prompt);
Shell.terminal.add(buf);
let exit;
let running = false;
let cmd_buf = "";
let cursorX = 0;
function add(char) {
    const len = char.length;
    while(cmd_buf.length + char.length <= cursorX) {
        char = " " + char;
    }
    cmd_buf = cmd_buf.slice(0, cursorX) + char+ cmd_buf.slice(cursorX);
    cursorX +=len;
    shell.terminal.cursor.x+=len;
}
function del() {
    if(cursorX === 0) return;
    cmd_buf = cmd_buf.slice(0, cursorX-1) + cmd_buf.slice(cursorX);
    cursorX--;
    shell.terminal.cursor.x--;
}

function clear() {
    return new Promise((r) => {
        setTimeout(() => {
            shell.gl.draw = () => {};
            shell.gl.setup = () => {};
            shell.keyPressed = () => {};
            shell.keyReleased = () => {};
            if (shell.gl.canvas !== false) {
                shell.gl.canvas.remove();
            }
            shell.terminal.scroll.allow = false;
            shell.gl.canvas = false;
            shell.exit = false;
            shell.mouseClicked = () => {};
            shell.mouseDragged = () => {};
            shell.mousePressed = () => {};
            shell.mouseReleased = () => {};
            shell.mouseMoved = () => {};
            shell.onExit = () => {};
            shell.windowResized = () => {};
            shell.gl.ready = false;
            shell.terminal.background = undefined;
            running = false;
            r();
        }, 100);
    });
}

function keyPressed(keyCode, key) {
    switch(keyCode) {
        case LEFT_ARROW:
            if(cursorX > 0) cursorX--;
            break;
        case RIGHT_ARROW:
            cursorX++;
            break;
        case BACKSPACE:
            del();
            break;
        case ENTER:
            running = true;
            if(cmd_buf.trim() === ":exit:") {
                clear().then(exit);
            }
            shell.terminal.add("\n")
            shell.run(cmd_buf.trim()).then(v => {
                clear().then(() => {
                    running = false;
                    if(v !== undefined) shell.terminal.add(v);
                    buf = shell.terminal.text() + "\n";
                    renderline(c.prompt)
                    shell.terminal.clear();
                    shell.terminal.add(buf)
                    cmd_buf = ""
                    cursorX = 0;
                })
            });
        default:
            if(key.length === 1) {
                add(key)
            }
    }
    Shell.terminal.text(buf + cmd_buf);
}

Shell.keyPressed = (keyCode, key) => {
    if (!running) {
        keyPressed(keyCode, key);
        return;
    }
    shell.keyPressed(keyCode, key);
};
Shell.keyReleased = (keyCode, key) => {
    shell.keyReleased(keyCode, key);
};
Shell.mouseClicked = (mouseButton) => {
    shell.mouseClicked(mouseButton);
};
Shell.mouseDragged = () => {
    shell.mouseDragged();
};
Shell.mousePressed = (mouseButton) => {
    shell.mousePressed(mouseButton);
};
Shell.mouseReleased = (mouseButton) => {
    shell.mouseReleased(mouseButton);
};
Shell.mouseMoved = () => {
    shell.mouseMoved();
};

await run((r) => {exit = r});

