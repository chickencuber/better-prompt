if(!await FS.exists("/user/better-prompt/history")) await FS.addFile("/user/better-prompt/history", "");
if(!await FS.exists("/user/better-prompt/conf.json")) await FS.copy("/bin/better-prompt/default.json", "/user/better-prompt/conf.json");

