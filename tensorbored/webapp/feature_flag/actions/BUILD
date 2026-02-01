load("//tensorbored/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "actions",
    srcs = [
        "feature_flag_actions.ts",
    ],
    deps = [
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/store:types",
        "@npm//@ngrx/store",
    ],
)
