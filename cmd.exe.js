const c = JSON.parse(await FS.getFromPath("/user/better-prompt/conf.json"));
if(Shell.supports_fansi) {
    Shell.terminal.background = c.background || 0;
}
Shell.terminal.clear();
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
    Shell.terminal.add(str + "\n");
}

renderline(c.startup);
renderline(c.prompt);
await run()

