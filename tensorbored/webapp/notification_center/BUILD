load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "notification_center",
    srcs = [
        "_notification_center_module.ts",
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp/notification_center/_data_source",
        "//tensorbored/webapp/notification_center/_redux",
        "//tensorbored/webapp/notification_center/_redux:actions",
        "//tensorbored/webapp/notification_center/_redux:types",
        "//tensorbored/webapp/notification_center/_views",
        "//tensorbored/webapp/persistent_settings",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [],
)

tf_ng_web_test_suite(
    name = "notification_center_test",
    testonly = True,
    deps = [
        "//tensorbored/webapp/notification_center/_data_source:_data_source_test",
        "//tensorbored/webapp/notification_center/_redux:_redux_test",
        "//tensorbored/webapp/notification_center/_views:_views_test",
    ],
)
