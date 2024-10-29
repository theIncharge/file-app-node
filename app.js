const fs = require("fs/promises");

(async () => {
  const createFile = async (path) => {
    let existingFileHandle;
    try {
      existingFileHandle = await fs.open(path, "r");
      console.log("file already exist");
      existingFileHandle.close();
      return;
    } catch (error) {
      const newFileHandle = await fs.open(path, "w");
      console.log("file has been created");
      newFileHandle.close();
    }
  };

  const deleteFile = async (path) => {
    console.log("deleting file at ", path);
    try {
      await fs.unlink(path);
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log("no file at this path");
      } else {
        console.log("unknown error occurred");
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    console.log("renaming file ", oldPath, " to ", newPath);
    try {
      await fs.rename(oldPath, newPath);
      console.log("the file was successfully renamed");
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log("doesnot exist");
      } else {
        console.log("error occured");
      }
    }
  };

  const addToFile = async (path, content) => {
    console.log("adding to this path ", path, " to content ", content);
    try {
      const fileHandle = await fs.open(path, "a");
      fileHandle.write(content);
    } catch (error) {
      console.log(error);
    }
  };

  // commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";
  const commandFileHandeler = await fs.open("command.txt", "r");
  commandFileHandeler.on("change", async () => {
    // Get the size of our file
    const size = (await commandFileHandeler.stat()).size;
    // allocate buffer
    const buff = Buffer.alloc(size);
    const offset = 0;
    const position = 0;

    await commandFileHandeler.read(buff, offset, size, position);
    const command = buff.toString("utf-8");

    // create a file
    // create a file <path>
    if (command.includes("create a file")) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      console.log(filePath);
      createFile(filePath);
    }
    //delete a file
    //delete the file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }
    //rename file:
    //renmae the file <path> to <newPath>
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilePath = command.substring(_idx + 4);
      renameFile(oldFilePath, newFilePath);
    }
    //add to file
    //add to the file <path>
    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + 15);
      addToFile(filePath, content);
    }
  });

  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change" && event.filename === "command.txt") {
      commandFileHandeler.emit("change");
    }
  }
})();
