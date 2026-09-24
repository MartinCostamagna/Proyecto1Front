import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import React from "react";
import { FormValues, schema } from "../interfaces/interfaces-validaciones-superlinea";
import SuperlineaService from "../services/superlinea-service";
import { parseApiError } from "../../../../utils/errores";
import { Tags } from "lucide-react";
import { getUsuarioId } from "../../../../utils/auth";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";

export default function RegistrarActualizarSuperlineaForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (mensajeAlerta: string, denominacionCreada: string) => void;
}) {
  const usuarioId = getUsuarioId();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {},
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
    setError,
  } = methods;

  const onSubmit = async (formData: FormValues) => {
    let response: ResponsePost;
    try {
      const payload = { ...formData, usuarioCreatedId: usuarioId };
      response = await SuperlineaService.nuevo(payload);
      onClose();
      onSuccess(response.mensaje, formData.denominacion);
    } catch (error) {
      setError("root", { type: "manual", message: parseApiError(error) });
    }
  };

  const handleOnClose = async () => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DEFAULT,
      title: TituloAlertaConfirmacion.DEFAULT,
      message: "¿Estás seguro de que quieres cerrar el formulario? NO se guardaran los cambios.",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });
    if (confirmed) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
      <Card className="w-full max-w-2xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden transform transition-all duration-300 ease-in-out">
        <EncabezadoFormularios
          title="Registrar Superlínea"
          subtitle="Ingresa los datos de la nueva Superlínea."
          icon={<Tags className="form-icon" />}
          onClose={handleOnClose}
        />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-3 px-3 py-2">
              <FormInput name="denominacion" label="Denominación" placeholder="Ingresa la denominación" />

              <FormInput name="observacion" label="Observación" placeholder="Ingresa una observación (opcional)" />
            </CardContent>

            {errors.root?.message && (
              <div className="text-red-600 text-center mb-4">{String(errors.root.message)}</div>
            )}

            <CardFooter className="flex justify-center">
              <Button type="submit" disabled={isSubmitting} className="btn btn-dark">
                {isSubmitting ? "Registrando..." : "Registrar"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
      <AlertasConfirmacion />
    </div>
  );
}