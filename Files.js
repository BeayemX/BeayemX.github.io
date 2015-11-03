"use strict"
class Project
{
    constructor()
    {
        this.files = [];
    }

    AddFile(file)
    {
        this.files.push(file);
    }
}

class File
{
    constructor()
    {
        this.lines = [];
    }

    AddLine()
    {
        CleanUpFile();
        UpdateStats();

    }

    RemoveLine()
    {
        // CleanUpFile();
        UpdateStats();
    }

    CleanUpFile()
    {

    }

    UpdateStats()
    {

    }

}