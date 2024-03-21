import {type Ref, ref} from "vue";

export function useItems(values: Ref<string[]>) {
    const newValue = ref<string>('')

    const add = () => {
        values.value.push(newValue.value)

        newValue.value = ''
    }

    const remove = (value: string) => {
        values.value.splice(values.value.indexOf(value), 1)
    }

    return {
        newValue,
        add,
        remove
    }
}