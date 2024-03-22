import {type Ref, ref, unref} from "vue";

export function useItems(values: Ref<string[]>) {
    const newValue = ref<string>('')
    const error = ref<string>('')

    const add = () => {
        error.value = '';

        const newVal = unref(newValue)

        if (!newVal) {
            return
        }

        newValue.value = ''

        if (values.value.includes(newVal)) {
            error.value = `${newVal} вече е добавен`
            return
        }
        values.value.push(newVal)
    }

    const remove = (value: string) => {
        values.value.splice(values.value.indexOf(value), 1)
    }

    return {
        newValue,
        add,
        remove,
        error,
    }
}