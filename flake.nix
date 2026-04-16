{
  description = "React and Go development environment (Pure Nix)";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      # Systems you want to support
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      # Helper function to generate an attrset '{ x86_64-linux = f "x86_64-linux"; ... }'
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;

      # Nixpkgs instantiated for each system
      nixpkgsFor = forAllSystems (system: import nixpkgs { inherit system; });
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgsFor.${system};
        in
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              # Go
              go_1_26
              gotools

              # grpc
              protobuf
              protoc-gen-doc
              protoc-gen-es

              # Nix / OS stuff
              nixfmt
              openssl

              # Node (React)
              nodejs_24
              typescript-language-server

              # Postgres
              postgresql_18
            ];

            packages = [
              (pkgs.writeShellScriptBin "pg-start" ''
                pg_ctl -l "$PGDATA/server.log" -o "--unix_socket_directories='$PGDATA'" start && sleep 0.5 && \
                psql -h "$POSTGRES_HOST" -d postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';" 2>/dev/null || true # create postgres user
              '')
              (pkgs.writeShellScriptBin "pg-stop" ''
                pg_ctl stop
              '')
            ];

            shellHook = ''
              # Setup local Postgres
              export PGDATA="$PWD/.direnv/db"
              if [ ! -d "$PGDATA" ]; then
                initdb --auth=trust -D "$PGDATA"
              fi
              export POSTGRES_HOST="$PGDATA"

              # Welcome message
              echo
              echo "--- Dev Environment Active ---"
              echo "Go: $(go version | cut -d ' ' -f3)"
              echo "Node: $(node --version)"
              echo "Postgres: $(postgres --version)"
              echo "Run 'pg-start' to launch the database."
              echo

              echo
              echo "--- Environment Variables ---"
              echo "RPCHAT_ENV=$RPCHAT_ENV"
              echo "RPCHAT_SERVER_HOST=$RPCHAT_SERVER_HOST"
              echo "POSTGRES_DB=$POSTGRES_DB"
              echo "POSTGRES_USER=$POSTGRES_USER"
              echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
              echo "RPCHAT_ADMIN_PASSWORD=$RPCHAT_ADMIN_PASSWORD"
              echo "PGOPTIONS=$PGOPTIONS"
              echo
            '';
          };
        }
      );
    };
}
