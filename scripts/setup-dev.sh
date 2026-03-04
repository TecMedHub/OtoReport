#!/bin/bash
set -e

echo "=== OtoReport: Instalación de dependencias de desarrollo ==="

# Detect package manager
if command -v pacman &> /dev/null; then
    echo "Detectado: Arch Linux"
    sudo pacman -S --needed \
        webkit2gtk-4.1 \
        base-devel \
        curl \
        wget \
        file \
        openssl \
        appmenu-gtk-module \
        gtk3 \
        libappindicator-gtk3 \
        librsvg \
        patchelf
elif command -v apt &> /dev/null; then
    echo "Detectado: Debian/Ubuntu"
    sudo apt update
    sudo apt install -y \
        libwebkit2gtk-4.1-dev \
        build-essential \
        curl \
        wget \
        file \
        libssl-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        patchelf
elif command -v dnf &> /dev/null; then
    echo "Detectado: Fedora/RHEL"
    sudo dnf install -y \
        webkit2gtk4.1-devel \
        openssl-devel \
        curl \
        wget \
        file \
        libappindicator-gtk3-devel \
        librsvg2-devel \
        patchelf
else
    echo "Gestor de paquetes no soportado. Instala las dependencias manualmente."
    exit 1
fi

# Install Rust if not present
if ! command -v rustc &> /dev/null; then
    echo "Instalando Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Install Node.js dependencies
echo "Instalando dependencias Node.js..."
npm install

echo "=== Instalación completada ==="
echo "Ejecuta 'npm run tauri dev' para iniciar el desarrollo"
