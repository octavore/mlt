# mlt

`mlt` enables you to embed various JSON config files into your `package.json` file, and have them selectively extracted when running commands which require them.

## Example

To embed `bower.json`:

```
$ mlt set bower.json
```

To link `bower` to the embedded file:

```
$ mlt register bower bower.json
```

Now your `package.json` file should contain the following:

```
# package.json
{
    ...
    "configFiles": {
        "_mapping": {
            "bower": "bower.json",
        },
        "bower.json": {
            "devDependencies": {
                "react": "~15.3.2",
            }
        }
    }
}
```

Then run `mlt bower install`, which will extract `bower.json`, run `bower install`, and then delete the extracted file.

## Why?

Sometimes there are just too many config files! For example, my Typescript projects typically have `tsconfig.json`, `typings.json`, `tslint.json`, in addition to `package.json` and `bower.json`. This tool allows you to consolidate all of them into a single file.


