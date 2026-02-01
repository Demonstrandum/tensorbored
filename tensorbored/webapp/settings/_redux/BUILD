load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored/webapp/settings:__subpackages__"])

licenses(["notice"])

tf_ng_module(
    name = "_redux",
    srcs = [
        "settings_actions.ts",
        "settings_reducers.ts",
        "settings_selectors.ts",
        "settings_types.ts",
    ],
    visibility = ["//tensorbored:internal"],
    deps = [
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/util:colors",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "_redux_test",
    testonly = True,
    srcs = [
        "settings_reducers_test.ts",
    ],
    visibility = ["//tensorbored:internal"],
    deps = [
        ":_redux",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/settings:testing",
        "//tensorbored/webapp/types",
        "@npm//@types/jasmine",
    ],
)
