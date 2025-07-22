pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral() // ESSA LINHA É ESSENCIAL PARA A BIBLIOTECA COIL
    }
}
rootProject.name = "SobrevivaANoite"
include(":app")