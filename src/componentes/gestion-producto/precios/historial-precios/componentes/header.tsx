import { History, RotateCcw } from "lucide-react";
import { Button } from "../../../../ui/Button";
import { CardHeader, CardTitle } from "../../../../ui/Card";
import { EstadisticasSimples } from "../../../../herramientas/reutilizables/estadisticas-simples";

interface HeaderProps {
  entidadesTotales: number;
  datosLength: number;
  onRefrescar: () => void;
  loading: boolean;
}

export const HeaderHistorial = ({
  entidadesTotales,
  datosLength,
  onRefrescar,
  loading,
}: HeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between p-4 gap-4">
      <div className="flex items-center gap-6">
        <CardTitle className="flex items-center space-x-2">
          <History className="consultar-icon w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-base sm:text-xl font-semibold">Historial de precios</span>
        </CardTitle>

        <EstadisticasSimples filtrados={entidadesTotales} mostrados={datosLength} />
      </div>

      <Button
        variant="outline"
        onClick={onRefrescar}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-sm"
      >
        <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Actualizar</span>
      </Button>
    </CardHeader>
  );
};
