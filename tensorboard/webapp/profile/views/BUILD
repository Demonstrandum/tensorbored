load("//tensorboard/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])

tf_ng_module(
    name = "views",
    srcs = [
        "profile_menu_component.ts",
        "profile_menu_container.ts",
        "profile_menu_module.ts",
    ],
    deps = [
        "//tensorboard/webapp:app_state",
        "//tensorboard/webapp/profile:types",
        "//tensorboard/webapp/profile/actions",
        "//tensorboard/webapp/profile/store",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/material/button",
        "@npm//@angular/material/divider",
        "@npm//@angular/material/icon",
        "@npm//@angular/material/menu",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)
