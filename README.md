# POC of new Gerrit UI in AngularJS

## Precondition ##

Custom gerrit version with change #[59886](https://gerrit-review.googlesource.com/#/c/59886/).

## Build ##

`zip -r0 gerrit-angular-ui static`

## Deploy ##

`cp gerrit-angular-ui.zip $gerrit_home/plugins/gerrit-angular-ui.jar`

## URLs ##

http://localhost:8080/#/x/gerrit-angular-ui/q
