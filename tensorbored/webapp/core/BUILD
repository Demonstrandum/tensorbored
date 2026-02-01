load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "core",
    srcs = [
        "core_module.ts",
        "index.ts",
    ],
    deps = [
        ":state",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/effects",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/core/views:layout",
        "//tensorbored/webapp/deeplink",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/webapp_data_source",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "state",
    srcs = [
        "state.ts",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
    ],
)
