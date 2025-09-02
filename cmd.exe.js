const {fakeShell} = await use("~/fakeShell.exe")
const c = JSON.parse(await FS.getFromPath("/user/better-prompt/conf.json"));
const shell = fakeShell();
function fixCursor() {
    if (!shell.terminal.scroll.allow && running) return;
    if(!running) {
        shell.terminal.scroll.x = 0;
    }
    if (getRect().right > shell.size.width) {
        shell.terminal.scroll.x += getRect().right - shell.size.width;
    } else if (getRect().left < 0) {
        shell.terminal.scroll.x += getRect().left;
    }
    if (getRect().bottom > shell.size.height) {
        shell.terminal.scroll.y += getRect().bottom - shell.size.height;
    } else if (getRect().top < 0) {
        shell.terminal.scroll.y += getRect().top;
    }
}
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
}

function keyPressed(keyCode, key) {
    switch(keyCode) {
        case BACKSPACE:
            del();
            break;
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

