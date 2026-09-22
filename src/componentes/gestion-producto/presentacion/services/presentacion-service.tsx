import { FormValues } from "../interfaces/interfaces-validaciones-presentacion";
import { createCrudService } from "../../../../utils/crudFactory";

const PresentacionService = createCrudService<FormValues>("presentacion");

export default PresentacionService;