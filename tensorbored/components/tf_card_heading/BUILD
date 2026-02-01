load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_card_heading",
    srcs = [
        "tf-card-heading.ts",
        "tf-card-heading-style.ts",
        "util.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:register_style_dom_module",
        "//tensorbored/components/tf_markdown_view",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)
