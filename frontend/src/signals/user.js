import { signal, computed } from '@preact/signals';

const user = signal({ autenticado: false, respostasSemConta: 0 });

export default user;
