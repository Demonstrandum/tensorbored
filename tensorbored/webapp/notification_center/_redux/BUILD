load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored/webapp/notification_center:__subpackages__"])

licenses(["notice"])

tf_ng_module(
    name = "_redux",
    srcs = [
        "notification_center_effects.ts",
        "notification_center_reducers.ts",
        "notification_center_selectors.ts",
    ],
    visibility = ["//tensorbored:internal"],
    deps = [
        ":actions",
        ":types",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/notification_center:types",
        "//tensorbored/webapp/notification_center/_data_source",
        "//tensorbored/webapp/persistent_settings",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "actions",
    srcs = [
        "notification_center_actions.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/notification_center/_data_source:types",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "notification_center_types.ts",
    ],
    visibility = ["//tensorbored:internal"],
    deps = [
        "//tensorbored/webapp/notification_center/_data_source:types",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = [
        "testing.ts",
    ],
    visibility = ["//tensorbored/webapp/testing:__subpackages__"],
    deps = [
        ":types",
    ],
)

tf_ts_library(
    name = "_redux_test",
    testonly = True,
    srcs = [
        "notification_center_effects_test.ts",
        "notification_center_reducers_test.ts",
        "notification_center_selectors_test.ts",
    ],
    deps = [
        ":_redux",
        ":actions",
        ":testing",
        ":types",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/core/testing",
        "//tensorbored/webapp/notification_center/_data_source",
        "//tensorbored/webapp/notification_center/_data_source:testing",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/webapp_data_source:http_client_testing",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
