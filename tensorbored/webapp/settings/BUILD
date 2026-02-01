load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "settings",
    srcs = [
        "index.ts",
        "settings_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/settings/_redux",
        "//tensorbored/webapp/settings/_views",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ng_web_test_suite(
    name = "karma_test",
    deps = [
        "//tensorbored/webapp/settings/_redux:_redux_test",
        "//tensorbored/webapp/settings/_views:test_lib",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = ["testing.ts"],
    deps = [
        "//tensorbored/webapp/settings/_redux",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/util:colors",
    ],
)
